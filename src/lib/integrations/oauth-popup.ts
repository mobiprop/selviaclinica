/**
 * Opens a popup to a provider's authorize URL and waits for our own callback
 * route (same origin) to `postMessage` back a result before closing itself.
 * Used by both Google and Meta now that both exchange the code server-side.
 */
export function openOAuthPopup(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const width = 480;
    const height = 640;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(
      url,
      "selvia-oauth",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      reject(new Error("Popup was blocked — allow popups for this site and try again"));
      return;
    }

    let settled = false;

    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "selvia-integration-result") return;
      settled = true;
      window.removeEventListener("message", handleMessage);
      clearInterval(pollClosed);
      if (event.data.success) resolve();
      else reject(new Error(event.data.error ?? "Connection failed"));
    }

    window.addEventListener("message", handleMessage);

    const pollClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(pollClosed);
        window.removeEventListener("message", handleMessage);
        if (!settled) reject(new Error("Connection window was closed before finishing"));
      }
    }, 500);
  });
}
