/**
 * API Configuration for FunWebGames
 * Configure your external API endpoints here
 * 
 * To enable cloud sync:
 * 1. Set API_BASE_URL to your backend endpoint
 * 2. Set API_TOKEN to your auth token (or implement getToken())
 * 3. Include this file before api-sync.js in your HTML
 */

// API Configuration
const API_CONFIG = {
  // Base URL for your API server
  // Example: 'https://api.funwebgames.com/v1'
  // Example: 'https://your-project.firebaseio.com'
  BASE_URL: '',
  
  // Authentication token (optional for public APIs)
  TOKEN: '',
  
  // Enable/disable sync (set to true to enable)
  ENABLED: false,
  
  // Sync settings
  SETTINGS: {
    // Auto-sync on new high score
    autoSyncScores: true,
    
    // Fetch leaderboard on game load
    fetchLeaderboardOnLoad: true,
    
    // Cache duration in milliseconds (default: 1 hour)
    cacheMaxAge: 3600000,
    
    // Max retries for failed sync
    maxRetries: 3,
    
    // Retry delay in milliseconds
    retryDelay: 5000
  }
};

// Optional: Function to get token dynamically
// Override this if you need to refresh tokens
API_CONFIG.getToken = function() {
  return this.TOKEN;
};

// Optional: Function to check if user is authenticated
API_CONFIG.isAuthenticated = function() {
  return !!this.getToken();
};

// Initialize API Sync with current config
function initAPISync() {
  if (typeof APISync !== 'undefined' && API_CONFIG.ENABLED && API_CONFIG.BASE_URL) {
    APISync.init(API_CONFIG.BASE_URL, API_CONFIG.getToken());
    console.log('FunWebGames: Cloud sync enabled');
  } else {
    console.log('FunWebGames: Cloud sync disabled (configure in api-config.js)');
  }
}

// Auto-initialize when script loads
if (typeof APISync !== 'undefined') {
  initAPISync();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API_CONFIG;
}
