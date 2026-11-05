# munch. for Android (Capacitor)

[Capacitor](https://github.com/ionic-team/capacitor) wraps the built web app (`dist/`) in a real Android
project. The result is an `.apk` you can install on any phone, and an `.aab` you can upload to Google Play.

Capacitor 8 needs **Node 22+** and **JDK 21**.

## Option A — no Android Studio: build the APK on GitHub (easiest)
1. Push this project to a GitHub repository (project files at the repo root).
2. Repo → **Settings → Secrets and variables → Actions** → add (optional but needed for real sign-in / sync):
   `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_MUNCH_API_URL`.
3. Repo → **Actions → Build Android APK → Run workflow**. It takes ~5–8 minutes.
4. Open the finished run, download the **munch-debug-apk** artifact, unzip it, and copy `app-debug.apk`
   to your phone. Tap it and allow "install unknown apps" for your browser/files app.

## Option B — build on your own computer
Install Node 22+, JDK 21 and Android Studio (it installs the Android SDK), then:
```bash
npm install
npm run android:apk     # builds the web app, creates android/, icons, splash, then the debug APK
# → android/app/build/outputs/apk/debug/app-debug.apk
npm run android:open    # or open the project in Android Studio and press ▶ with a phone plugged in
```
`npm run android:init` does the one-time setup only: `npx cap add android`, adds the location
permissions the nearby-restaurant search needs, generates the app icon + splash from `assets/`, and syncs.
After any web change just run `npm run android:apk` again (or `npm run build && npx cap sync android`).

## Required: let the app talk to your API
Inside the app the page is served from **`https://localhost`**. Add it to the allowed origins on the API host:
```
APP_ORIGIN=https://your-site.example,https://localhost
```
Without it, sync / invites / photos calls fail with CORS errors. If you use Clerk, also test sign-in on a real
phone: Clerk's web SDK inside a WebView depends on your Clerk instance settings (allowed origins, and
production keys expect a real domain). Demo mode (no keys) works fully offline.

## Publishing on Google Play
1. Google Play Console developer account (one-off US$25) and a privacy policy URL (the app handles email and location).
2. Change `appId` in `capacitor.config.ts` (currently `app.munch.near`) **before the first upload**. It can never change afterwards.
3. Create a release keystore **once** and keep it safe (losing it means you cannot update the app):
   `keytool -genkeypair -v -storetype PKCS12 -keystore munch-release.jks -alias munch -keyalg RSA -keysize 2048 -validity 10000`
4. Build the bundle: `npm run android:aab`, then sign it in **Android Studio → Build → Generate Signed App Bundle**
   (select the existing `android/` project and your keystore), or enable Play App Signing and upload.
5. Bump `versionCode` / `versionName` in `android/app/build.gradle` for every upload.
6. Fill in the store listing (screenshots, description, content rating, data-safety form) and submit.

## What is native vs web
- Same UI as the web app; the install banner is hidden and the service worker is skipped inside the app.
- Location uses the normal browser API; Android shows its permission dialog (manifest permissions are added by `scripts/android.mjs`).
- The icon and splash come from `assets/` (replace those PNGs and run `npm run android:init`).
