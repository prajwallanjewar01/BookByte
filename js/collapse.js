/**
 * ===================================================================
 * collapse.js
 * Centralized Collapse Animation Orchestrator for BookByte OS Modules
 * ===================================================================
 */

export function initSectionCollification() {
  const toggleHeaders = document.querySelectorAll('.section-header[role="button"]');

  toggleHeaders.forEach(header => {
    // Intercept immediate pointer executions
    header.addEventListener('click', (e) => {
      // Prevent internal module actions from firing parent click chains
      if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select')) {
        return;
      }
      toggleSectionState(header);
    });

    // Wire accessible keyboard confirmation paths (Spacebar and Enter)
    header.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault(); // Prevents layout page scroll loops on Spacebar presses
        toggleSectionState(header);
      }
    });
  });
}

/**
 * Modulates core attribute states across the targeted application node trees
 * @param {HTMLElement} header Element selector targeting container attributes
 */
function toggleSectionState(header) {
  const isExpanded = header.getAttribute('aria-expanded') === 'true';
  const targetContentId = header.getAttribute('aria-controls');
  const targetWrapper = document.getElementById(targetContentId);

  // Invert string-based boolean flags
  const nextState = !isExpanded;
  header.setAttribute('aria-expanded', String(nextState));

  if (targetWrapper) {
    if (nextState) {
      // Expanded State Accessibility Management
      targetWrapper.removeAttribute('aria-hidden');
    } else {
      // Collapsed State Accessibility Management
      targetWrapper.setAttribute('aria-hidden', 'true');
    }
  }
}