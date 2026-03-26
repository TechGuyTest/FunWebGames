/**
 * Help Modal System for FunWebGames
 * Shows simple, child-friendly instructions for each game
 * 
 * Usage:
 *   HelpModal.show('color-match', '🎨', 'Flip cards to find matching pairs!');
 *   HelpModal.hide();
 *   HelpModal.showIfFirstTime('game-id', '🎨', 'Instructions...');
 */

const HelpModal = (function() {
  const STORAGE_PREFIX = 'funwebgames-help-';
  let modalElement = null;
  
  // Create modal DOM if it doesn't exist
  function ensureModal() {
    if (modalElement) return modalElement;
    
    modalElement = document.createElement('div');
    modalElement.className = 'help-modal';
    modalElement.setAttribute('role', 'dialog');
    modalElement.setAttribute('aria-modal', 'true');
    modalElement.setAttribute('aria-labelledby', 'help-modal-title');
    
    modalElement.innerHTML = `
      <div class="help-modal__content">
        <h2 class="help-modal__title" id="help-modal-title">How to Play</h2>
        <div class="help-modal__emoji" id="help-modal-emoji"></div>
        <p class="help-modal__instructions" id="help-modal-instructions"></p>
        <button class="btn btn-primary help-modal__close" id="help-modal-close">Got it! ✓</button>
      </div>
    `;
    
    document.body.appendChild(modalElement);
    
    // Close button handler
    const closeBtn = modalElement.querySelector('#help-modal-close');
    closeBtn.addEventListener('click', hide);
    
    // Close on background click
    modalElement.addEventListener('click', (e) => {
      if (e.target === modalElement) {
        hide();
      }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalElement.classList.contains('visible')) {
        hide();
      }
    });
    
    return modalElement;
  }
  
  // Show help modal
  function show(emoji, instructions) {
    const modal = ensureModal();
    const emojiEl = modal.querySelector('#help-modal-emoji');
    const instructionsEl = modal.querySelector('#help-modal-instructions');
    
    emojiEl.textContent = emoji;
    instructionsEl.textContent = instructions;
    
    modal.classList.add('visible');
    
    // Focus the close button for accessibility
    setTimeout(() => {
      modal.querySelector('#help-modal-close').focus();
    }, 100);
  }
  
  // Hide help modal
  function hide() {
    const modal = ensureModal();
    modal.classList.remove('visible');
  }
  
  // Check if user has seen help for a game
  function hasSeenHelp(gameId) {
    try {
      return localStorage.getItem(STORAGE_PREFIX + gameId) === 'seen';
    } catch (e) {
      return false;
    }
  }
  
  // Mark help as seen for a game
  function markAsSeen(gameId) {
    try {
      localStorage.setItem(STORAGE_PREFIX + gameId, 'seen');
    } catch (e) {
      // localStorage not available, continue silently
    }
  }
  
  // Show help if first time visiting this game
  function showIfFirstTime(gameId, emoji, instructions) {
    if (!hasSeenHelp(gameId)) {
      show(emoji, instructions);
      markAsSeen(gameId);
      return true;
    }
    return false;
  }
  
  // Create help button that shows modal
  function createHelpButton(gameId, emoji, instructions) {
    const btn = document.createElement('button');
    btn.className = 'help-btn';
    btn.setAttribute('aria-label', 'Show help');
    btn.setAttribute('title', 'Help');
    btn.innerHTML = '❓';
    
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      show(emoji, instructions);
    });
    
    return btn;
  }
  
  // Reset all help (for testing)
  function reset() {
    Object.keys(localStorage)
      .filter(key => key.startsWith(STORAGE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  }
  
  // Public API
  return {
    show,
    hide,
    hasSeenHelp,
    markAsSeen,
    showIfFirstTime,
    createHelpButton,
    reset
  };
})();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HelpModal;
}
