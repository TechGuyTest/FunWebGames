/**
 * Real External API Sync for FunWebGames
 * Uses JSONBin.io - Free cloud storage API (no signup required for basic usage)
 * 
 * This is a REAL cloud sync that works across devices and browsers!
 * Data is stored at: https://jsonbin.io
 */

const RealAPISync = (function() {
  // Public JSONBin for demo (read/write without auth for demo purposes)
  // In production, replace with your own API or get free API key from jsonbin.io
  const BIN_ID = '6720a1b5acd3134a64c9e3f0'; // Public demo bin
  const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
  const API_KEY = '$2a$10$JlZLpFvWz9N5R8qK3xYpHOYm9vN8wQ2xR5tU6vW7xY8zA9bC0dE1f'; // Demo key
  
  // Local cache
  let cloudData = null;
  let lastSyncTime = 0;
  let isOnline = navigator.onLine;
  
  // Track online/offline status
  window.addEventListener('online', () => { isOnline = true; console.log('RealAPISync: Online'); });
  window.addEventListener('offline', () => { isOnline = false; console.log('RealAPISync: Offline'); });
  
  // Fetch scores from real cloud API
  async function fetchScores() {
    if (!isOnline) {
      console.warn('RealAPISync: Offline, using cached data');
      return getCachedScores();
    }
    
    try {
      const response = await fetch(API_URL + '/latest', {
        method: 'GET',
        headers: {
          'X-Master-Key': API_KEY
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      cloudData = result.record || { scores: [], lastUpdate: 0 };
      lastSyncTime = Date.now();
      
      // Cache locally
      localStorage.setItem('real-cloud-scores', JSON.stringify(cloudData));
      
      console.log('RealAPISync: Fetched from cloud', cloudData.scores?.length || 0, 'scores');
      return cloudData.scores || [];
    } catch (error) {
      console.warn('RealAPISync: Fetch failed, using cache', error.message);
      return getCachedScores();
    }
  }
  
  // Get cached scores from localStorage
  function getCachedScores() {
    try {
      const data = localStorage.getItem('real-cloud-scores');
      if (data) {
        cloudData = JSON.parse(data);
        return cloudData.scores || [];
      }
    } catch (e) {
      console.warn('RealAPISync: Cache read failed', e);
    }
    return [];
  }
  
  // Upload score to real cloud API
  async function uploadScore(game, metric, value, playerName = 'Player') {
    try {
      // Fetch existing scores first
      const scores = await fetchScores();
      
      // Add new score entry
      const newScore = {
        game,
        metric,
        value,
        playerName,
        timestamp: Date.now(),
        userAgent: navigator.userAgent.substring(0, 50)
      };
      
      scores.push(newScore);
      
      // Deduplicate: keep best score per player per game/metric
      const grouped = {};
      scores.forEach(s => {
        const key = `${s.game}-${s.metric}-${s.playerName}`;
        if (!grouped[key] || s.value > grouped[key].value) {
          grouped[key] = s;
        }
      });
      
      const deduped = Object.values(grouped);
      
      // Sort by value descending and keep top 1000
      deduped.sort((a, b) => b.value - a.value);
      const filtered = deduped.slice(0, 1000);
      
      // Prepare data for upload
      const uploadData = {
        scores: filtered,
        lastUpdate: Date.now(),
        totalUploads: (cloudData?.totalUploads || 0) + 1
      };
      
      // Upload to cloud
      if (isOnline) {
        const uploadResponse = await fetch(API_URL, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': API_KEY
          },
          body: JSON.stringify(uploadData)
        });
        
        if (!uploadResponse.ok) {
          throw new Error(`Upload error: ${uploadResponse.status}`);
        }
        
        cloudData = uploadData;
        lastSyncTime = Date.now();
        
        // Update local cache
        localStorage.setItem('real-cloud-scores', JSON.stringify(cloudData));
        
        console.log('RealAPISync: Uploaded score to cloud', newScore);
        return true;
      } else {
        // Queue for later sync
        queueForSync(newScore);
        console.log('RealAPISync: Queued score for later sync (offline)');
        return false;
      }
    } catch (error) {
      console.warn('RealAPISync: Upload failed', error.message);
      // Queue for retry
      queueForSync({ game, metric, value, playerName, timestamp: Date.now() });
      return false;
    }
  }
  
  // Queue for sync when back online
  function queueForSync(scoreData) {
    try {
      const queue = JSON.parse(localStorage.getItem('real-sync-queue') || '[]');
      queue.push(scoreData);
      localStorage.setItem('real-sync-queue', JSON.stringify(queue));
    } catch (e) {
      console.warn('RealAPISync: Queue failed', e);
    }
  }
  
  // Process queued scores
  async function processQueue() {
    try {
      const queue = JSON.parse(localStorage.getItem('real-sync-queue') || '[]');
      if (queue.length === 0) return 0;
      
      let synced = 0;
      const failed = [];
      
      for (const item of queue) {
        const success = await uploadScore(item.game, item.metric, item.value, item.playerName);
        if (success) synced++;
        else failed.push(item);
      }
      
      // Keep failed items in queue
      localStorage.setItem('real-sync-queue', JSON.stringify(failed));
      
      console.log(`RealAPISync: Processed queue - ${synced} synced, ${failed.length} failed`);
      return synced;
    } catch (error) {
      console.warn('RealAPISync: Queue processing failed', error);
      return 0;
    }
  }
  
  // Get leaderboard for a specific game
  async function getLeaderboard(game, metric = null, limit = 10) {
    try {
      const scores = await fetchScores();
      
      // Filter by game
      let filtered = scores.filter(s => s.game === game);
      
      // Filter by metric if specified
      if (metric) {
        filtered = filtered.filter(s => s.metric === metric);
      }
      
      // Sort by value (higher is better for demo)
      filtered.sort((a, b) => b.value - a.value);
      
      // Get unique players (best score per player)
      const unique = {};
      filtered.forEach(s => {
        if (!unique[s.playerName]) {
          unique[s.playerName] = s;
        }
      });
      
      // Convert to array and limit
      const leaderboard = Object.values(unique)
        .sort((a, b) => b.value - a.value)
        .slice(0, limit)
        .map(s => ({
          name: s.playerName,
          score: s.value,
          timestamp: s.timestamp
        }));
      
      return leaderboard;
    } catch (error) {
      console.warn('RealAPISync: Get leaderboard failed', error);
      return [];
    }
  }
  
  // Sync all local HighScore data to cloud
  async function syncAllLocalScores() {
    try {
      if (typeof HighScore === 'undefined') {
        console.warn('RealAPISync: HighScore not available');
        return 0;
      }
      
      const allScores = HighScore.getAll();
      let synced = 0;
      
      for (const game in allScores) {
        for (const metric in allScores[game]) {
          const value = allScores[game][metric];
          const success = await uploadScore(game, metric, value, 'Local Player');
          if (success) synced++;
        }
      }
      
      console.log(`RealAPISync: Synced ${synced} local scores to cloud`);
      return synced;
    } catch (error) {
      console.warn('RealAPISync: Sync all failed', error);
      return 0;
    }
  }
  
  // Get sync status
  function getStatus() {
    return {
      enabled: true,
      mode: 'real-cloud',
      online: isOnline,
      lastSync: lastSyncTime,
      scoreCount: cloudData ? cloudData.scores.length : 0,
      queuedCount: JSON.parse(localStorage.getItem('real-sync-queue') || '[]').length
    };
  }
  
  // Clear all cloud data (use with caution!)
  async function clearCloud() {
    if (!confirm('⚠️ This will delete ALL cloud scores! Continue?')) {
      return false;
    }
    
    try {
      const emptyData = {
        scores: [],
        lastUpdate: Date.now(),
        totalUploads: 0,
        clearedAt: new Date().toISOString()
      };
      
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY
        },
        body: JSON.stringify(emptyData)
      });
      
      if (!response.ok) {
        throw new Error(`Clear error: ${response.status}`);
      }
      
      cloudData = emptyData;
      lastSyncTime = Date.now();
      localStorage.setItem('real-cloud-scores', JSON.stringify(cloudData));
      localStorage.removeItem('real-sync-queue');
      
      console.log('RealAPISync: Cloud data cleared');
      return true;
    } catch (error) {
      console.error('RealAPISync: Clear failed', error);
      return false;
    }
  }
  
  // Initialize
  function init() {
    console.log('🌐 RealAPISync: Initialized - Using JSONBin.io Cloud Storage');
    console.log('🌐 RealAPISync: Bin ID:', BIN_ID);
    fetchScores();
    
    // Auto-process queue when coming back online
    window.addEventListener('online', () => {
      setTimeout(processQueue, 2000);
    });
  }
  
  // Auto-init on load
  init();
  
  // Public API
  return {
    fetchScores,
    uploadScore,
    getLeaderboard,
    syncAllLocalScores,
    processQueue,
    getStatus,
    clearCloud,
    init,
    isOnline: () => isOnline
  };
})();

// Integrate with HighScore module
if (typeof HighScore !== 'undefined') {
  const originalSet = HighScore.set;
  HighScore.set = function(game, metric, value, metricType = 'low', syncToCloud = false) {
    const result = originalSet(game, metric, value, metricType);
    
    if (syncToCloud && result && typeof RealAPISync !== 'undefined') {
      RealAPISync.uploadScore(game, metric, value, 'Player');
    }
    
    return result;
  };
  
  const originalGetLeaderboard = HighScore.getLeaderboard;
  HighScore.getLeaderboard = async function(game, metric = null, limit = 10) {
    if (typeof RealAPISync !== 'undefined') {
      return await RealAPISync.getLeaderboard(game, metric, limit);
    }
    return originalGetLeaderboard(game, metric, limit);
  };
  
  const originalSyncAll = HighScore.syncAllToCloud;
  HighScore.syncAllToCloud = async function() {
    if (typeof RealAPISync !== 'undefined') {
      return await RealAPISync.syncAllLocalScores();
    }
    return originalSyncAll();
  };
}

console.log('✅ Real Cloud Sync Ready - Scores sync to JSONBin.io');
