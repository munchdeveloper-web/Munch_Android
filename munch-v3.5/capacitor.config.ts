import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Wraps the built web app (dist/) in a native Android shell.
 * Change appId BEFORE your first Play Store upload: it is permanent once published.
 */
const config: CapacitorConfig = {
  appId: "app.munch.near",
  appName: "munch.",
  webDir: "dist",
  backgroundColor: "#eadfc8",
  server: {
    // The app is served from https://localhost inside the WebView. Add that exact origin to
    // APP_ORIGIN on your API host (see docs/ANDROID.md) or sign-in and sync calls are blocked by CORS.
    androidScheme: "https",
  },
};

export default config;
