/**
 * Keyboard Navigation Module for FunWebGames
 * Provides keyboard support for all games
 * 
 * Features:
 * - Tab/Shift+Tab navigation
 * - Enter/Space to activate
 * - Arrow keys for grid navigation
 * - Escape to go back
 */

const KeyboardNav = (function() {
  'use strict';
  
  let enabled = false;
  let lastKeyTime = 0;
  
  // Initialize keyboard navigation
  function init() {
    if (enabled) return;
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Show hint on first tab press
    document.addEventListener('keydown', function showHint(e) {
      if (e.key === 'Tab') {
        showKeyboardHint();
        document.removeEventListener('keydown', showHint);
      }
    });
    
    enabled = true;
    console.log('♿ Keyboard navigation enabled');
  }
  
  // Show keyboard hint
  function showKeyboardHint() {
    let hint = document.querySelector('.keyboard-hint');
    if (!hint) {
      hint = document.createElement('div');
      hint.className = 'keyboard-hint visible';
      hint.innerHTML = '⌨️ <kbd>Tab</kbd> navigate, <kbd>Enter</kbd> select, <kbd>Esc</kbd> back';
      document.body.appendChild(hint);
      
      // Hide after 5 seconds
      setTimeout(() => {
        hint.classList.remove('visible');
      }, 5000);
    }
  }
  
  // Handle keydown events
  function handleKeyDown(e) {
    const activeElement = document.activeElement;
    
    // Escape - go back
    if (e.key === 'Escape') {
      const backBtn = document.querySelector('.back-btn, [href="index.html"], [href="../index.html"]');
      if (backBtn) {
        backBtn.click();
        e.preventDefault();
      }
      return;
    }
    
    // Enter/Space - activate
    if (e.key === 'Enter' || e.key === ' ') {
      if (activeElement.tagName === 'BUTTON' || 
          activeElement.tagName === 'A' ||
          activeElement.classList.contains('btn') ||
          activeElement.classList.contains('game-card')) {
        // Let default behavior handle it
        return;
      }
    }
    
    // Arrow keys - navigate grid
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      handleArrowNavigation(e, activeElement);
    }
    
    // Tab - track for accessibility
    if (e.key === 'Tab') {
      lastKeyTime = Date.now();
    }
  }
  
  // Handle keyup events
  function handleKeyUp(e) {
    // Space button activation
    if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      e.target.click();
    }
  }
  
  // Handle arrow key navigation
  function handleArrowNavigation(e, activeElement) {
    e.preventDefault();
    
    // Find focusable elements
    const focusable = getFocusableElements();
    const currentIndex = focusable.indexOf(activeElement);
    
    if (currentIndex === -1) return;
    
    let nextIndex;
    const cols = getGridColumns();
    
    switch(e.key) {
      case 'ArrowRight':
        nextIndex = currentIndex + 1;
        break;
      case 'ArrowLeft':
        nextIndex = currentIndex - 1;
        break;
      case 'ArrowDown':
        nextIndex = currentIndex + cols;
        break;
      case 'ArrowUp':
        nextIndex = currentIndex - cols;
        break;
    }
    
    // Wrap around
    if (nextIndex >= focusable.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = focusable.length - 1;
    
    focusable[nextIndex].focus();
  }
  
  // Get all focusable elements
  function getFocusableElements() {
    return Array.from(document.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), ' +
      'select:not([disabled]), textarea:not([disabled]), ' +
      '[tabindex]:not([tabindex="-1"]), .game-card'
    )).filter(el => {
      return el.offsetParent !== null; // Visible elements only
    });
  }
  
  // Get grid columns (for arrow navigation)
  function getGridColumns() {
    const grid = document.querySelector('.game-grid');
    if (!grid) return 3;
    
    const style = window.getComputedStyle(grid);
    const cols = style.getPropertyValue('--grid-columns') || 
                 style.gridTemplateColumns.split(' ').length || 3;
    return parseInt(cols, 10) || 3;
  }
  
  // Add ARIA labels to elements
  function addAriaLabels() {
    // Game cards
    document.querySelectorAll('.game-card').forEach(card => {
      const name = card.querySelector('.game-card__name');
      if (name && !card.getAttribute('aria-label')) {
        card.setAttribute('aria-label', `Play ${name.textContent}`);
      }
      if (!card.getAttribute('role')) {
        card.setAttribute('role', 'button');
      }
    });
    
    // Buttons
    document.querySelectorAll('button').forEach(btn => {
      if (!btn.getAttribute('aria-label') && !btn.textContent.trim()) {
        btn.setAttribute('aria-label', btn.title || 'Button');
      }
    });
    
    // Back button
    const backBtn = document.querySelector('.back-btn');
    if (backBtn && !backBtn.getAttribute('aria-label')) {
      backBtn.setAttribute('aria-label', 'Back to games list');
    }
  }
  
  // Make element keyboard accessible
  function makeKeyboardAccessible(element, options = {}) {
    if (!element.getAttribute('tabindex')) {
      element.setAttribute('tabindex', '0');
    }
    
    if (!element.getAttribute('role')) {
      element.setAttribute('role', options.role || 'button');
    }
    
    if (options.label && !element.getAttribute('aria-label')) {
      element.setAttribute('aria-label', options.label);
    }
    
    // Handle Enter and Space
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        element.click();
      }
    });
  }
  
  // Announce to screen readers
  function announce(message, priority = 'polite') {
    let announcer = document.querySelector('.sr-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.className = 'sr-announcer sr-only';
      announcer.setAttribute('aria-live', priority);
      announcer.setAttribute('aria-atomic', 'true');
      document.body.appendChild(announcer);
    }
    
    // Clear and set message
    announcer.textContent = '';
    setTimeout(() => {
      announcer.textContent = message;
    }, 100);
  }
  
  // Public API
  return {
    init,
    makeKeyboardAccessible,
    announce,
    addAriaLabels,
    isEnabled: () => enabled
  };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    KeyboardNav.init();
    KeyboardNav.addAriaLabels();
  });
} else {
  KeyboardNav.init();
  KeyboardNav.addAriaLabels();
}

// Export for use in games
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KeyboardNav;
}
