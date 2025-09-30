/**
 * Show a notification/toast.
 * Tries a global toast setter (window.__setToasts). Falls back to alert in dev.
 */
export type NotifyType = "info" | "success" | "error";

export function notify(
  title: string,
  message: string,
  type: NotifyType = "info"
) {
  // Avoid SSR side effects
  if (typeof window === "undefined") {
    console.log(`[notify:${type}] ${title} - ${message}`);
    return;
  }

  // If you use a toast provider and set window.__setToasts in _app.(js|tsx)
  if ((window as any).__setToasts) {
    (window as any).__setToasts((prev: any[]) => [
      ...prev,
      { title, message, type, id: Date.now() + Math.random() },
    ]);
  } else {
    // Fallback: dev alert
    alert(`${title}\n\n${message}`);
  }
}

export default notify;

