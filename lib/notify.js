// lib/notify.js

/**
 * Show a notification/toast.
 * Tries a global toast setter (window.__setToasts). Falls back to alert in dev.
 *
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {"info"|"success"|"error"} [type] - Notification type
 */
const notify = (title, message, type = "info") => {
  // Avoid SSR side effects
  if (typeof window === "undefined") {
    // On the server, just log so builds never crash
    // (you can remove this if you prefer a no-op)
    console.log(`[notify:${type}] ${title} - ${message}`);
    return;
  }

  // If you use a toast provider and set window.__setToasts in _app.(js|tsx)
  if (window.__setToasts) {
    window.__setToasts((prev) => [
      ...prev,
      { title, message, type, id: Date.now() + Math.random() },
    ]);
  } else {
    // Fallback: dev alert
    alert(`${title}\n\n${message}`);
  }
};

export default notify;
// 👇 Add named export so both import styles work:
//   import notify from '../lib/notify'
//   import { notify } from '../lib/notify'
export { notify };




