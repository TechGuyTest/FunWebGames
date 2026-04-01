/**
 * Leaderboard Widget for FunWebGames
 * Displays cloud-synced high scores with fallback to local scores
 * 
 * Usage:
 *   LeaderboardWidget.show('color-match', 'moves-easy');
 *   LeaderboardWidget.hide();
 */

const LeaderboardWidget = (function() {
  let widgetElement = null;
  
  // Create widget HTML
  function createWidget() {
    if (widgetElement) {
      return widgetElement;
    }
    
    widgetElement = document.createElement('div');
    widgetElement.id = 'leaderboard-widget';
    widgetElement.className = 'leaderboard-widget hidden';
    widgetElement.innerHTML = `
      <div class="leaderboard-widget__header">
        <h3>🏆 Leaderboard</h3>
        <button class="leaderboard-widget__close" aria-label="Close leaderboard">&times;</button>
      </div>
      <div class="leaderboard-widget__content">
        <div class="leaderboard-widget__tabs">
          <button class="tab-btn active" data-tab="local">📍 Local</button>
          <button class="tab-btn" data-tab="cloud">☁️ Cloud</button>
        </div>
        <div class="leaderboard-widget__scores" id="leaderboard-scores">
          <p class="loading">Loading scores...</p>
        </div>
      </div>
      <style>
        .leaderboard-widget {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          z-index: 10000;
          width: 90%;
          max-width: 400px;
          max-height: 80vh;
          overflow: hidden;
        }
        .leaderboard-widget.hidden {
          display: none;
        }
        .leaderboard-widget__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 2px solid #f0f0f0;
        }
        .leaderboard-widget__header h3 {
          margin: 0;
          color: #333;
        }
        .leaderboard-widget__close {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: #999;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .leaderboard-widget__close:hover {
          color: #333;
        }
        .leaderboard-widget__content {
          padding: 20px;
          max-height: 60vh;
          overflow-y: auto;
        }
        .leaderboard-widget__tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }
        .tab-btn {
          flex: 1;
          padding: 8px 16px;
          border: 2px solid #e0e0e0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }
        .tab-btn.active {
          background: #FF6B6B;
          color: white;
          border-color: #FF6B6B;
        }
        .tab-btn:hover:not(.active) {
          background: #f5f5f5;
        }
        .leaderboard-widget__scores {
          min-height: 100px;
        }
        .leaderboard-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border-bottom: 1px solid #f0f0f0;
        }
        .leaderboard-item:last-child {
          border-bottom: none;
        }
        .leaderboard-item__rank {
          font-weight: bold;
          color: #FF6B6B;
          width: 30px;
        }
        .leaderboard-item__rank.gold { color: #FFD700; }
        .leaderboard-item__rank.silver { color: #C0C0C0; }
        .leaderboard-item__rank.bronze { color: #CD7F32; }
        .leaderboard-item__name {
          flex: 1;
          margin-left: 12px;
        }
        .leaderboard-item__score {
          font-weight: bold;
          color: #333;
        }
        .loading, .error {
          text-align: center;
          color: #999;
          padding: 20px;
        }
        .error {
          color: #FF6B6B;
        }
      </style>
    `;
    
    document.body.appendChild(widgetElement);
    
    // Add close button handler
    widgetElement.querySelector('.leaderboard-widget__close').addEventListener('click', hide);
    
    // Add tab handlers
    widgetElement.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        widgetElement.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        loadScores(e.target.dataset.tab);
      });
    });
    
    return widgetElement;
  }
  
  // Load scores for display
  async function loadScores(tab) {
    const scoresContainer = document.getElementById('leaderboard-scores');
    const currentGame = widgetElement.dataset.game || 'unknown';
    const currentMetric = widgetElement.dataset.metric || 'score';
    
    scoresContainer.innerHTML = '<p class="loading">Loading scores...</p>';
    
    try {
      if (tab === 'cloud' && typeof APISync !== 'undefined' && APISync.isEnabled()) {
        // Load from cloud
        const leaderboard = await HighScore.getLeaderboard(currentGame, currentMetric, 10);
        displayScores(scoresContainer, leaderboard || []);
      } else {
        // Load local scores
        const localScore = HighScore.get(currentGame, currentMetric);
        const scores = localScore !== null ? [{
          name: 'You',
          score: localScore,
          isUser: true
        }] : [];
        displayScores(scoresContainer, scores);
      }
    } catch (error) {
      scoresContainer.innerHTML = '<p class="error">Failed to load scores. Showing local scores.</p>';
      const localScore = HighScore.get(currentGame, currentMetric);
      if (localScore !== null) {
        displayScores(scoresContainer, [{ name: 'You (Local)', score: localScore, isUser: true }]);
      } else {
        scoresContainer.innerHTML = '<p class="loading">No scores yet. Be the first to play!</p>';
      }
    }
  }
  
  // Display scores in the widget
  function displayScores(container, scores) {
    if (!scores || scores.length === 0) {
      container.innerHTML = '<p class="loading">No scores yet. Be the first to play!</p>';
      return;
    }
    
    container.innerHTML = scores.map((entry, index) => {
      let rankClass = '';
      if (index === 0) rankClass = 'gold';
      else if (index === 1) rankClass = 'silver';
      else if (index === 2) rankClass = 'bronze';
      
      return `
        <div class="leaderboard-item">
          <span class="leaderboard-item__rank ${rankClass}">#${index + 1}</span>
          <span class="leaderboard-item__name">${entry.name || 'Player'}</span>
          <span class="leaderboard-item__score">${entry.score}</span>
        </div>
      `;
    }).join('');
  }
  
  // Show the widget
  function show(game, metric) {
    const widget = createWidget();
    widget.dataset.game = game;
    widget.dataset.metric = metric;
    widget.classList.remove('hidden');
    
    // Load local scores by default
    loadScores('local');
  }
  
  // Hide the widget
  function hide() {
    if (widgetElement) {
      widgetElement.classList.add('hidden');
    }
  }
  
  // Toggle widget visibility
  function toggle(game, metric) {
    if (widgetElement && !widgetElement.classList.contains('hidden')) {
      hide();
    } else {
      show(game, metric);
    }
  }
  
  // Check if widget is visible
  function isVisible() {
    return widgetElement && !widgetElement.classList.contains('hidden');
  }
  
  // Public API
  return {
    show,
    hide,
    toggle,
    isVisible,
    loadScores
  };
})();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LeaderboardWidget;
}
