import { useSyncExternalStore } from "react";

/**
 * Install state for the PWA.
 *
 * Chrome/Edge/Android fire `beforeinstallprompt` once, early, so the listener is attached when this
 * module is imported (from main.tsx), not when a component mounts. iOS Safari never fires it, so
 * there we show Add-to-Home-Screen instructions instead.
 */

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export type InstallState = {
  /** Already running as an installed app (home-screen icon / app window). */
  installed: boolean;
  /** Browser can show its native one-tap install dialog. */
  canPrompt: boolean;
  /** iPhone / iPad Safari: no prompt API, needs manual Share → Add to Home Screen. */
  ios: boolean;
};

const DISMISS_KEY = "munch:install:dismissed";
const DISMISS_DAYS = 14;

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

/** True inside the Capacitor Android/iOS shell: it is already an installed app. */
export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return cap?.isNativePlatform?.() === true;
}

function detectStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (isNativeApp()) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    nav.standalone === true
  );
}

function detectIos(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iDevice = /iphone|ipad|ipod/i.test(ua);
  // iPadOS 13+ reports as a Mac with touch support.
  const iPadOs = /macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
  // In-app browsers and non-Safari iOS browsers can't add to home screen the same way, but
  // Safari is where the instructions apply; CriOS/FxiOS on iOS 16.4+ can too, so we don't exclude them.
  return iDevice || iPadOs;
}

let state: InstallState = {
  installed: detectStandalone(),
  canPrompt: false,
  ios: detectIos(),
};

function update(next: Partial<InstallState>) {
  state = { ...state, ...next };
  listeners.forEach((fn) => fn());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault(); // we show our own button instead of the browser's mini-infobar
    deferred = event as BeforeInstallPromptEvent;
    update({ canPrompt: true });
  });

  window.addEventListener("appinstalled", () => {
    deferred = null;
    update({ installed: true, canPrompt: false });
  });

  window
    .matchMedia("(display-mode: standalone)")
    .addEventListener("change", () => update({ installed: detectStandalone() }));
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function useInstall(): InstallState & { install: () => Promise<"accepted" | "dismissed" | "unavailable"> } {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
  return { ...snapshot, install };
}

export async function install(): Promise<"accepted" | "dismissed" | "unavailable"> {
  if (!deferred) return "unavailable";
  const prompt = deferred;
  deferred = null; // a prompt can only be used once
  update({ canPrompt: false });
  try {
    await prompt.prompt();
    const choice = await prompt.userChoice;
    return choice.outcome;
  } catch {
    return "unavailable";
  }
}

/** True when the user closed the install banner recently. */
export function installRecentlyDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    return Date.now() - Number(raw) < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function rememberInstallDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    /* storage blocked: banner may reappear next visit, which is acceptable */
  }
}
