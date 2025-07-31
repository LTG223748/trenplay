// lib/notify.js

/**
 * Show a notification/toast.
 * By default, it calls a global setToasts function if available (like a toast provider).
 * If not, it falls back to alert (for dev/testing).
 *
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {"info"|"success"|"error"} [type] - Notification type
 */
const notify = (title, message, type = "info") => {
  // If you use a toast provider and set window.__setToasts in _app.js
  if (typeof window !== "undefined" && window.__setToasts) {
    window.__setToasts((prev) => [
      ...prev,
      { title, message, type, id: Date.now() + Math.random() }
    ]);
  } else {
    // Fallback: dev alert
    alert(`${title}\n\n${message}`);
  }
};

export default notify;



