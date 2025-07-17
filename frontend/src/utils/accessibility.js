// Accessibility utilities and helpers

// Focus management
export const focusManagement = {
  // Trap focus within a container
  trapFocus: (container) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  },

  // Focus first focusable element
  focusFirst: (container) => {
    const focusableElement = container.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElement) {
      focusableElement.focus();
    }
  },

  // Restore focus to previous element
  restoreFocus: (previousElement) => {
    if (previousElement && previousElement.focus) {
      previousElement.focus();
    }
  }
};

// Keyboard navigation helpers
export const keyboardNavigation = {
  // Handle arrow key navigation
  handleArrowKeys: (e, items, currentIndex, onSelect) => {
    let newIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowDown':
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        e.preventDefault();
        break;
      case 'ArrowUp':
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        e.preventDefault();
        break;
      case 'Home':
        newIndex = 0;
        e.preventDefault();
        break;
      case 'End':
        newIndex = items.length - 1;
        e.preventDefault();
        break;
      case 'Enter':
      case ' ':
        if (onSelect) {
          onSelect(currentIndex);
          e.preventDefault();
        }
        break;
    }
    
    return newIndex;
  },

  // Handle escape key
  handleEscape: (e, callback) => {
    if (e.key === 'Escape') {
      callback();
      e.preventDefault();
    }
  }
};

// Screen reader utilities
export const screenReader = {
  // Announce message to screen readers
  announce: (message, priority = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  // Create visually hidden text for screen readers
  createSROnlyText: (text) => {
    const span = document.createElement('span');
    span.className = 'sr-only';
    span.textContent = text;
    return span;
  }
};

// Color contrast utilities
export const colorContrast = {
  // Check if color combination meets WCAG standards
  checkContrast: (foreground, background) => {
    const getLuminance = (color) => {
      const rgb = parseInt(color.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;
      
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };
    
    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    
    return {
      ratio: ratio,
      AA: ratio >= 4.5,
      AAA: ratio >= 7,
      AALarge: ratio >= 3,
      AAALarge: ratio >= 4.5
    };
  }
};

// Form accessibility helpers
export const formAccessibility = {
  // Generate unique IDs for form elements
  generateId: (prefix = 'field') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Create accessible error message
  createErrorMessage: (fieldId, message) => {
    const errorId = `${fieldId}-error`;
    const errorElement = document.createElement('div');
    errorElement.id = errorId;
    errorElement.className = 'text-red-600 text-sm mt-1';
    errorElement.setAttribute('role', 'alert');
    errorElement.textContent = message;
    return { errorElement, errorId };
  },

  // Validate form accessibility
  validateFormAccessibility: (form) => {
    const issues = [];
    
    // Check for labels
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const label = form.querySelector(`label[for="${input.id}"]`);
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledBy = input.getAttribute('aria-labelledby');
      
      if (!label && !ariaLabel && !ariaLabelledBy) {
        issues.push(`Input ${input.name || input.type} is missing a label`);
      }
    });
    
    // Check for required field indicators
    const requiredInputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    requiredInputs.forEach(input => {
      const hasAriaRequired = input.getAttribute('aria-required') === 'true';
      const hasVisualIndicator = input.parentElement.querySelector('.required-indicator');
      
      if (!hasAriaRequired) {
        issues.push(`Required field ${input.name || input.type} should have aria-required="true"`);
      }
    });
    
    return issues;
  }
};

// Modal accessibility
export const modalAccessibility = {
  // Setup modal accessibility
  setupModal: (modalElement, triggerElement) => {
    // Set ARIA attributes
    modalElement.setAttribute('role', 'dialog');
    modalElement.setAttribute('aria-modal', 'true');
    modalElement.setAttribute('tabindex', '-1');
    
    // Trap focus
    const cleanup = focusManagement.trapFocus(modalElement);
    
    // Focus modal
    modalElement.focus();
    
    // Handle escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    
    const closeModal = () => {
      cleanup();
      document.removeEventListener('keydown', handleEscape);
      focusManagement.restoreFocus(triggerElement);
    };
    
    document.addEventListener('keydown', handleEscape);
    
    return closeModal;
  }
};

// Skip links for keyboard navigation
export const skipLinks = {
  // Create skip link
  createSkipLink: (targetId, text = 'Skip to main content') => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-primary-500 text-white p-2 z-50';
    skipLink.textContent = text;
    
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.focus();
        target.scrollIntoView();
      }
    });
    
    return skipLink;
  },
  
  // Add skip links to page
  addSkipLinks: () => {
    const skipLinksContainer = document.createElement('div');
    skipLinksContainer.className = 'skip-links';
    
    const mainSkipLink = skipLinks.createSkipLink('main-content', 'Skip to main content');
    const navSkipLink = skipLinks.createSkipLink('navigation', 'Skip to navigation');
    
    skipLinksContainer.appendChild(mainSkipLink);
    skipLinksContainer.appendChild(navSkipLink);
    
    document.body.insertBefore(skipLinksContainer, document.body.firstChild);
  }
};

// Export all utilities
export default {
  focusManagement,
  keyboardNavigation,
  screenReader,
  colorContrast,
  formAccessibility,
  modalAccessibility,
  skipLinks
};