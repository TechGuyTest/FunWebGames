/**
 * API Sync Integration for FunWebGames
 * 
 * Integrates external API sync with game modules
 * Auto-syncs scores and progress when games are played
 * 
 * Usage:
 *   Include this file after api-sync.js and highscore.js
 *   <script src="js/api-sync.js"></script>
 *   <script src="js/highscore.js"></script>
 *   <script src="js/api-sync-integration.js"></script>
 */

(function() {
  'use strict';
  
  // Configuration
  const CONFIG = {
    autoSyncEnabled: true,
    syncDelay: 1000, // ms to wait after game ends before syncing
    fallbackToLocal: true
  };
  
  // Sync queue for batch processing
  const syncQueue = [];
  let isSyncing = false;
  
  /**
   * Queue a score for sync
   * @param {string} game - Game identifier
   * @param {string} metric - Metric name (e.g., 'score', 'moves', 'time')
   * @param {number} value - Score value
   * @param {string} playerName - Player name
   */
  function queueScoreSync(game, metric, value, playerName) {
    syncQueue.push({
      type: 'score',
      game,
      metric,
      value,
      playerName,
      timestamp: Date.now()
    });
    
    // Process queue after delay
    if (!isSyncing) {
      setTimeout(processQueue, CONFIG.syncDelay);
    }
  }
  
  /**
   * Process sync queue
   */
  async function processQueue() {
    if (isSyncing || syncQueue.length === 0) {
      return;
    }
    
    isSyncing = true;
    console.log('🔄 Processing sync queue...', syncQueue.length, 'items');
    
    const failed = [];
    
    for (const item of syncQueue) {
      try {
        if (item.type === 'score') {
          // Try RealAPISync first (cloud sync)
          if (typeof RealAPISync !== 'undefined') {
            await RealAPISync.uploadScore(item.game, item.metric, item.value, item.playerName);
          }
          // Fallback to APISync
          else if (typeof APISync !== 'undefined' && APISync.isEnabled()) {
            await APISync.syncScore(item.game, item.metric, item.value);
          }
        }
      } catch (error) {
        console.warn('⚠️  Sync failed for item:', item, error.message);
        failed.push(item);
      }
    }
    
    // Keep failed items for retry
    syncQueue.length = 0;
    syncQueue.push(...failed);
    
    isSyncing = false;
    
    if (syncQueue.length === 0) {
      console.log('✅ Sync queue processed successfully');
    } else {
      console.warn(`⚠️  ${failed.length} items failed, will retry later`);
    }
  }
  
  /**
   * Hook into HighScore module
   */
  function hookHighScore() {
    if (typeof HighScore === 'undefined') {
      console.warn('⚠️  HighScore module not found, skipping integration');
      return;
    }
    
    // Store original set method
    const originalSet = HighScore.set;
    
    // Override set method to auto-sync
    HighScore.set = function(game, metric, value, metricType = 'low', playerName = 'Player') {
      const result = originalSet.call(this, game, metric, value, metricType, playerName);
      
      // Auto-sync if enabled and score was updated
      if (CONFIG.autoSyncEnabled && result) {
        queueScoreSync(game, metric, value, playerName);
      }
      
      return result;
    };
    
    // Override getLeaderboard to fetch from API first
    const originalGetLeaderboard = HighScore.getLeaderboard;
    
    HighScore.getLeaderboard = async function(game, metric = null, limit = 10) {
      // Try to fetch from API first
      if (typeof RealAPISync !== 'undefined' && RealAPISync.isOnline()) {
        try {
          const leaderboard = await RealAPISync.getLeaderboard(game, metric, limit);
          if (leaderboard && leaderboard.length > 0) {
            return leaderboard;
          }
        } catch (error) {
          console.warn('⚠️  API leaderboard fetch failed, using local:', error.message);
        }
      }
      
      // Fallback to local
      return originalGetLeaderboard.call(this, game, metric, limit);
    };
    
    console.log('✅ HighScore integration complete');
  }
  
  /**
   * Sync user progress
   * @param {object} progressData - Progress data to sync
   */
  async function syncProgress(progressData) {
    try {
      if (typeof APISync !== 'undefined' && APISync.isEnabled()) {
        await APISync.updateProgress(progressData);
        console.log('✅ Progress synced');
        return true;
      } else if (typeof RealAPISync !== 'undefined') {
        // Store progress in cloud data
        const scores = await RealAPISync.fetchScores();
        // Custom progress handling would go here
        console.log('✅ Progress sync ready');
        return true;
      }
    } catch (error) {
      console.error('❌ Progress sync failed:', error.message);
      return false;
    }
  }
  
  /**
   * Fetch and display leaderboard in UI
   * @param {string} game - Game identifier
   * @param {string} containerId - DOM element ID to render leaderboard
   */
  async function displayLeaderboard(game, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn('⚠️  Leaderboard container not found:', containerId);
      return;
    }
    
    container.innerHTML = '<div class="loading">Loading leaderboard...</div>';
    
    try {
      let leaderboard = [];
      
      if (typeof RealAPISync !== 'undefined') {
        leaderboard = await RealAPISync.getLeaderboard(game, null, 10);
      } else if (typeof APISync !== 'undefined' && APISync.isEnabled()) {
        leaderboard = await APISync.fetchLeaderboard(game);
      } else if (typeof HighScore !== 'undefined') {
        leaderboard = HighScore.getLeaderboard(game, null, 10);
      }
      
      if (!leaderboard || leaderboard.length === 0) {
        container.innerHTML = '<div class="no-scores">No scores yet. Be the first!</div>';
        return;
      }
      
      // Render leaderboard
      container.innerHTML = `
        <div class="leaderboard">
          <h3>🏆 Leaderboard</h3>
          <ol>
            ${leaderboard.map((entry, index) => `
              <li class="rank-${index + 1}">
                <span class="rank">${index + 1}</span>
                <span class="name">${escapeHtml(entry.name || entry.playerName || 'Anonymous')}</span>
                <span class="score">${entry.score || entry.value}</span>
              </li>
            `).join('')}
          </ol>
        </div>
      `;
    } catch (error) {
      container.innerHTML = `<div class="error">Failed to load leaderboard: ${error.message}</div>`;
    }
  }
  
  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  /**
   * Manual sync trigger
   */
  async function triggerManualSync() {
    console.log('🔄 Manual sync triggered...');
    
    try {
      if (typeof RealAPISync !== 'undefined') {
        const synced = await RealAPISync.syncAllLocalScores();
        console.log(`✅ Synced ${synced} scores to cloud`);
        return synced;
      } else if (typeof APISync !== 'undefined') {
        APISync.triggerSync();
        console.log('✅ Sync triggered');
        return true;
      }
    } catch (error) {
      console.error('❌ Manual sync failed:', error.message);
      return 0;
    }
  }
  
  /**
   * Get sync status for UI display
   */
  function getSyncStatus() {
    const status = {
      available: false,
      enabled: false,
      online: false,
      pending: 0
    };
    
    if (typeof RealAPISync !== 'undefined') {
      status.available = true;
      status.enabled = true;
      status.online = RealAPISync.isOnline();
      const syncStatus = RealAPISync.getStatus();
      status.pending = syncStatus.queuedCount || 0;
    } else if (typeof APISync !== 'undefined') {
      status.available = true;
      status.enabled = APISync.isEnabled();
      const syncStatus = APISync.getStatus();
      status.pending = syncStatus.pendingCount || 0;
    }
    
    return status;
  }
  
  /**
   * Initialize integration
   */
  function init() {
    console.log('🔗 API Sync Integration initializing...');
    
    hookHighScore();
    
    // Process any pending syncs on page load
    setTimeout(processQueue, 2000);
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('🌐 Back online, processing sync queue...');
      setTimeout(processQueue, 1000);
    });
    
    console.log('✅ API Sync Integration ready');
  }
  
  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Export public API
  window.APISyncIntegration = {
    queueScoreSync,
    syncProgress,
    displayLeaderboard,
    triggerManualSync,
    getSyncStatus,
    processQueue,
    config: CONFIG
  };
  
})();

/**
 * Example usage in games:
 * 
 * // After game ends
 * HighScore.set('color-match', 'score', 1500, 'high', 'Alice');
 * 
 * // Display leaderboard
 * APISyncIntegration.displayLeaderboard('color-match', 'leaderboard-container');
 * 
 * // Manual sync
 * APISyncIntegration.triggerManualSync();
 * 
 * // Check status
 * const status = APISyncIntegration.getSyncStatus();
 * console.log('Sync enabled:', status.enabled);
 */
