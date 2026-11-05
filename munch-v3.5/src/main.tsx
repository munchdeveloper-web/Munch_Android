import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import { isNativeApp } from "@/lib/pwa"; // also attaches the install-prompt listener before React mounts
import "./index.css";
import "./v31.css";
import "./v32.css";
import App from "./App";
import { AuthProvider } from "@/auth/AuthProvider";
import { CLERK_PUBLISHABLE_KEY, HAS_CLERK } from "@/lib/authConfig";

const tree = (
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);

createRoot(document.getElementById("root")!).render(
  HAS_CLERK ? (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      appearance={{
        variables: {
          colorPrimary: "#ae3a22",
          colorForeground: "#2d2216",
          colorBackground: "#fffdf5",
          colorInput: "#fff8e6",
          colorInputForeground: "#2d2216",
          colorNeutral: "#2d2216",
          fontFamily: "Nunito, ui-sans-serif, system-ui, sans-serif",
          borderRadius: "14px",
        },
      }}
    >
      {tree}
    </ClerkProvider>
  ) : (
    tree
  ),
);

// The Android/iOS app already ships every file, so a service worker would only add stale-cache risk.
if ("serviceWorker" in navigator && import.meta.env.PROD && !isNativeApp()) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // Installed apps stay open for days: check for a new version whenever the app returns to the foreground.
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") registration.update().catch(() => undefined);
        });
      })
      .catch(() => {
        /* offline shell is a progressive enhancement; the app works without it */
      });
  });
}
