/**
 * Connectivity abstraction.
 *
 * The dashboard can simulate a loss of ground link without touching the
 * browser's read-only `navigator.onLine`. The sync manager always asks this
 * module for the effective state, and still listens to real online/offline
 * browser events so it behaves correctly on actual networks.
 */

type ConnectivityListener = (online: boolean) => void;

let simulatedOnline: boolean | null = null;
let browserListenersBound = false;
const listeners = new Set<ConnectivityListener>();

function notify(): void {
  const online = getIsOnline();
  listeners.forEach((listener) => listener(online));
}

function bindBrowserListeners(): void {
  if (browserListenersBound || typeof window === 'undefined') return;

  browserListenersBound = true;
  window.addEventListener('online', notify);
  window.addEventListener('offline', notify);
}

/** Effective online state: simulation override first, then the real browser. */
export function getIsOnline(): boolean {
  if (simulatedOnline !== null) return simulatedOnline;
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

/** True when the operator has forced a simulated link state. */
export function isSimulatedConnectivity(): boolean {
  return simulatedOnline !== null;
}

/**
 * Force the effective link state, or pass `null` to return to the real browser
 * state. Dispatches native-looking events so existing listeners (including the
 * sync manager) react exactly as they would to a real network transition.
 */
export function setSimulatedOnline(online: boolean | null): void {
  simulatedOnline = online;

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(getIsOnline() ? 'online' : 'offline'));
  }
  notify();
}

export function subscribeConnectivity(
  listener: ConnectivityListener
): () => void {
  bindBrowserListeners();
  listeners.add(listener);
  listener(getIsOnline());

  return () => {
    listeners.delete(listener);
  };
}