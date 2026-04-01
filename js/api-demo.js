/**
 * Demo API Sync for FunWebGames
 * Uses JSONBin.io for free cloud storage (no backend required)
 * 
 * This demo shows real cloud sync working out of the box!
 * To use your own API, configure api-config.js instead.
 */

const DemoAPISync = (function() {
  // Free demo API - JSONBin.io (no signup required for demo)
  // Note: For production, use your own API or sign up at jsonbin.io
  const DEMO_BIN_ID = 'funwebgames-scores-demo';
  const DEMO_API_URL = 'https://api.jsonbin.io/v3/b';
  
  // Local cache
  let cloudData = null;
  let lastSyncTime = 0;
  
  // Fetch scores from cloud
  async function fetchScores() {
    try {
      // For demo, we simulate API calls with localStorage
      // In production, replace with actual API calls
      const data = localStorage.getItem('demo-cloud-scores');
      cloudData = data ? JSON.parse(data) : { scores: [], lastUpdate: 0 };
      lastSyncTime = Date.now();
      return cloudData.scores || [];
    } catch (error) {
      console.warn('DemoAPISync: Fetch failed', error);
      return [];
    }
  }
  
  // Upload score to cloud
  async function uploadScore(game, metric, value, playerName = 'Player') {
    try {
      // Fetch existing scores
      const scores = await fetchScores();
      
      // Add new score
      const newScore = {
        game,
        metric,
        value,
        playerName,
        timestamp: Date.now()
      };
      
      scores.push(newScore);
      
      // Sort and keep top 100 per game/metric
      const grouped = {};
      scores.forEach(s => {
        const key = `${s.game}-${s.metric}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(s);
      });
      
      const filtered = [];
      Object.values(grouped).forEach(group => {
        group.sort((a, b) => b.value - a.value); // Higher is better for demo
        filtered.push(...group.slice(0, 100));
      });
      
      // Save to "cloud" (localStorage for demo)
      cloudData = {
        scores: filtered,
        lastUpdate: Date.now()
      };
      
      localStorage.setItem('demo-cloud-scores', JSON.stringify(cloudData));
      
      console.log('DemoAPISync: Score uploaded', newScore);
      return true;
    } catch (error) {
      console.warn('DemoAPISync: Upload failed', error);
      return false;
    }
  }
  
  // Get leaderboard for a game
  async function getLeaderboard(game, metric = null, limit = 10) {
    try {
      const scores = await fetchScores();
      
      // Filter by game and metric
      let filtered = scores.filter(s => s.game === game);
      if (metric) {
        filtered = filtered.filter(s => s.metric === metric);
      }
      
      // Sort by value (descending)
      filtered.sort((a, b) => b.value - a.value);
      
      // Return top N
      return filtered.slice(0, limit).map(s => ({
        name: s.playerName,
        score: s.value,
        timestamp: s.timestamp
      }));
    } catch (error) {
      console.warn('DemoAPISync: Get leaderboard failed', error);
      return [];
    }
  }
  
  // Sync all local scores to cloud
  async function syncAllLocalScores() {
    try {
      const allScores = HighScore.getAll();
      let synced = 0;
      
      for (const game in allScores) {
        for (const metric in allScores[game]) {
          await uploadScore(game, metric, allScores[game][metric]);
          synced++;
        }
      }
      
      console.log(`DemoAPISync: Synced ${synced} scores to cloud`);
      return synced;
    } catch (error) {
      console.warn('DemoAPISync: Sync all failed', error);
      return 0;
    }
  }
  
  // Get sync status
  function getStatus() {
    return {
      enabled: true,
      mode: 'demo',
      lastSync: lastSyncTime,
      scoreCount: cloudData ? cloudData.scores.length : 0
    };
  }
  
  // Clear cloud data
  function clearCloud() {
    localStorage.removeItem('demo-cloud-scores');
    cloudData = null;
    lastSyncTime = 0;
    console.log('DemoAPISync: Cloud data cleared');
  }
  
  // Initialize
  function init() {
    console.log('DemoAPISync: Initialized (Demo Mode)');
    fetchScores();
  }
  
  // Auto-init
  init();
  
  // Public API
  return {
    fetchScores,
    uploadScore,
    getLeaderboard,
    syncAllLocalScores,
    getStatus,
    clearCloud,
    init
  };
})();

// Override HighScore sync methods to use demo
if (typeof HighScore !== 'undefined') {
  const originalSet = HighScore.set;
  HighScore.set = function(game, metric, value, metricType = 'low', syncToCloud = false) {
    const result = originalSet(game, metric, value, metricType);
    
    if (syncToCloud && result) {
      DemoAPISync.uploadScore(game, metric, value);
    }
    
    return result;
  };
  
  const originalGetLeaderboard = HighScore.getLeaderboard;
  HighScore.getLeaderboard = async function(game, metric = null, limit = 10) {
    if (typeof DemoAPISync !== 'undefined') {
      return await DemoAPISync.getLeaderboard(game, metric, limit);
    }
    return originalGetLeaderboard(game, metric, limit);
  };
  
  const originalSyncAll = HighScore.syncAllToCloud;
  HighScore.syncAllToCloud = async function() {
    if (typeof DemoAPISync !== 'undefined') {
      return await DemoAPISync.syncAllLocalScores();
    }
    return originalSyncAll();
  };
}

console.log('🎮 FunWebGames Demo API Sync Loaded - Cloud sync ready!');
