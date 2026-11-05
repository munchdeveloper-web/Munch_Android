# Installing and publishing munch.

## 1. Installable web app (done)
- Chrome / Edge / Android: an **Install** banner appears ~10 s after launch (and an *Install the app*
  row in Profile). One tap puts munch. on the home screen / app drawer, full screen, no browser bar.
- iPhone / iPad: Safari has no install API, so the banner opens a 3-step *Add to Home Screen* guide.
- Requirements: serve `dist/` over **HTTPS**. `manifest.webmanifest`, `sw.js` and the icons are in `public/`.
- After you ship a change, bump `VERSION` in `public/sw.js` so installed copies refresh.

## 2. Google Play Store (Trusted Web Activity)
A TWA wraps your hosted PWA in a real Android app. Needs a Google Play developer account (one-off US$25).
```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://YOUR-DOMAIN/manifest.webmanifest
bubblewrap build          # produces app-release-bundle.aab (upload to Play Console) and an .apk
```
Then put the SHA-256 fingerprint Bubblewrap prints into `public/.well-known/assetlinks.json`
(template included, replace the placeholders), redeploy, and the browser bar disappears inside the app.
Alternative without the command line: https://www.pwabuilder.com

## 3. Apple App Store
Apple rejects pure website wrappers. Use Capacitor (`npm i @capacitor/core @capacitor/ios`) and add at
least one native feature (push notifications, share sheet, native geolocation) before submitting.
Requires a Mac with Xcode and an Apple Developer account (US$99/yr).
