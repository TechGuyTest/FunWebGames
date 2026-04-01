/**
 * API Sync Module for FunWebGames
 * Syncs game data (high scores, progress) with external API
 * Supports offline-first with background sync
 * 
 * Usage:
 *   APISync.init('https://api.example.com', 'user-token');
 *   APISync.syncScores('color-match', 'moves', 25);
 *   APISync.fetchLeaderboard('color-match');
 */

const APISync = (function() {
  // Configuration
  let API_BASE_URL = '';
  let API_TOKEN = '';
  let SYNC_ENABLED = false;
  
  // Cache for offline support
  const CACHE_KEY = 'funwebgames-api-cache';
  const PENDING_SYNC_KEY = 'funwebgames-pending-sync';
  
  // Load pending sync items from localStorage
  function getPendingSync() {
    try {
      const data = localStorage.getItem(PENDING_SYNC_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('APISync: Could not load pending sync', e);
      return [];
    }
  }
  
  // Save pending sync items to localStorage
  function savePendingSync(pending) {
    try {
      localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pending));
    } catch (e) {
      console.warn('APISync: Could not save pending sync', e);
    }
  }
  
  // Add item to pending sync queue
  function addToPendingSync(data) {
    const pending = getPendingSync();
    pending.push({
      ...data,
      timestamp: Date.now()
    });
    savePendingSync(pending);
  }
  
  // Initialize the sync module
  function init(baseUrl, token = null) {
    API_BASE_URL = baseUrl;
    API_TOKEN = token;
    SYNC_ENABLED = !!token;
    
    console.log('APISync: Initialized', { 
      baseUrl: API_BASE_URL, 
      enabled: SYNC_ENABLED 
    });
    
    // Try to sync any pending items
    if (SYNC_ENABLED) {
      processPendingSync();
    }
  }
  
  // Make API request with error handling
  async function apiRequest(endpoint, options = {}) {
    if (!SYNC_ENABLED) {
      throw new Error('APISync: Not enabled. Call init() with a token first.');
    }
    
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    if (API_TOKEN) {
      headers['Authorization'] = `Bearer ${API_TOKEN}`;
    }
    
    try {
      const response = await fetch(url, {
        ...options,
        headers
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.warn('APISync: Request failed', error);
      throw error;
    }
  }
  
  // Sync high score to API
  async function syncScore(game, metric, value, metricType = 'low') {
    if (!SYNC_ENABLED) {
      // Queue for later sync
      addToPendingSync({
        type: 'score',
        game,
        metric,
        value,
        metricType
      });
      return false;
    }
    
    try {
      const result = await apiRequest('/scores', {
        method: 'POST',
        body: JSON.stringify({
          game,
          metric,
          value,
          metricType,
          timestamp: Date.now()
        })
      });
      
      return result.success || true;
    } catch (error) {
      // Queue for later sync
      addToPendingSync({
        type: 'score',
        game,
        metric,
        value,
        metricType
      });
      return false;
    }
  }
  
  // Fetch leaderboard for a game
  async function fetchLeaderboard(game, metric = null, limit = 10) {
    if (!SYNC_ENABLED) {
      // Return cached data if available
      return getCachedData(`leaderboard-${game}-${metric}`);
    }
    
    try {
      const endpoint = `/leaderboard/${game}?limit=${limit}${metric ? `&metric=${metric}` : ''}`;
      const data = await apiRequest(endpoint);
      
      // Cache the result
      cacheData(`leaderboard-${game}-${metric}`, data);
      
      return data;
    } catch (error) {
      // Return cached data if available
      return getCachedData(`leaderboard-${game}-${metric}`) || [];
    }
  }
  
  // Fetch user progress from API
  async function fetchProgress() {
    if (!SYNC_ENABLED) {
      return getCachedData('user-progress');
    }
    
    try {
      const data = await apiRequest('/progress');
      cacheData('user-progress', data);
      return data;
    } catch (error) {
      return getCachedData('user-progress') || {};
    }
  }
  
  // Update user progress on API
  async function updateProgress(progressData) {
    if (!SYNC_ENABLED) {
      addToPendingSync({
        type: 'progress',
        data: progressData
      });
      return false;
    }
    
    try {
      const result = await apiRequest('/progress', {
        method: 'PUT',
        body: JSON.stringify(progressData)
      });
      
      return result.success || true;
    } catch (error) {
      addToPendingSync({
        type: 'progress',
        data: progressData
      });
      return false;
    }
  }
  
  // Cache data in localStorage
  function cacheData(key, data) {
    try {
      const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      cache[key] = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
      console.warn('APISync: Could not cache data', e);
    }
  }
  
  // Get cached data
  function getCachedData(key, maxAge = 3600000) {
    try {
      const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      const entry = cache[key];
      
      if (!entry) {
        return null;
      }
      
      // Check if cache is still valid
      if (Date.now() - entry.timestamp > maxAge) {
        return null;
      }
      
      return entry.data;
    } catch (e) {
      console.warn('APISync: Could not read cache', e);
      return null;
    }
  }
  
  // Process pending sync items
  async function processPendingSync() {
    if (!SYNC_ENABLED) {
      return;
    }
    
    const pending = getPendingSync();
    if (pending.length === 0) {
      return;
    }
    
    console.log(`APISync: Processing ${pending.length} pending items`);
    
    const failed = [];
    
    for (const item of pending) {
      try {
        if (item.type === 'score') {
          await syncScore(item.game, item.metric, item.value, item.metricType);
        } else if (item.type === 'progress') {
          await updateProgress(item.data);
        }
      } catch (error) {
        failed.push(item);
      }
    }
    
    // Keep failed items for next retry
    savePendingSync(failed);
    
    if (failed.length === 0) {
      console.log('APISync: All pending items synced successfully');
    } else {
      console.warn(`APISync: ${failed.length} items failed, will retry later`);
    }
  }
  
  // Check if sync is enabled
  function isEnabled() {
    return SYNC_ENABLED;
  }
  
  // Manually trigger sync
  function triggerSync() {
    if (SYNC_ENABLED) {
      processPendingSync();
    }
  }
  
  // Clear all cached data
  function clearCache() {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(PENDING_SYNC_KEY);
  }
  
  // Get sync status
  function getStatus() {
    const pending = getPendingSync();
    return {
      enabled: SYNC_ENABLED,
      pendingCount: pending.length,
      baseUrl: API_BASE_URL
    };
  }
  
  // Public API
  return {
    init,
    syncScore,
    fetchLeaderboard,
    fetchProgress,
    updateProgress,
    isEnabled,
    triggerSync,
    clearCache,
    getStatus,
    processPendingSync
  };
})();

// Export for use in other files (if using modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APISync;
}
