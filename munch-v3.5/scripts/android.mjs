#!/usr/bin/env node
/**
 * munch. Android helper (Capacitor).
 *   node scripts/android.mjs init   create android/, add permissions, generate icons + splash, sync
 *   node scripts/android.mjs apk    init + build a debug APK you can install on any phone
 *   node scripts/android.mjs aab    init + build a release App Bundle (needs signing, see docs/ANDROID.md)
 *   node scripts/android.mjs open   open the project in Android Studio
 * Requires Node 22+, JDK 21 and the Android SDK (Android Studio installs the SDK).
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const run = (cmd, cwd) => execSync(cmd, { stdio: "inherit", cwd });
const win = process.platform === "win32";

function build() {
  // Capacitor copies dist/ into the app, so the web build must exist first.
  run("npm run build");
}

function patchManifest() {
  const file = "android/app/src/main/AndroidManifest.xml";
  if (!existsSync(file)) return;
  let xml = readFileSync(file, "utf8");
  if (xml.includes("ACCESS_FINE_LOCATION")) return;
  const perms = [
    '    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />',
    '    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />',
    '    <uses-feature android:name="android.hardware.location.gps" android:required="false" />',
  ].join("\n");
  xml = xml.replace("</manifest>", `${perms}\n</manifest>`);
  writeFileSync(file, xml);
  console.log("• Added location permissions to AndroidManifest.xml");
}

function init() {
  build();
  if (!existsSync("android")) run("npx cap add android");
  patchManifest();
  if (existsSync("assets/icon-only.png")) run("npx capacitor-assets generate --android");
  run("npx cap sync android");
}

function gradle(task) {
  run(win ? `gradlew.bat ${task}` : `./gradlew ${task}`, "android");
}

switch (process.argv[2]) {
  case "init":
    init();
    break;
  case "apk":
    init();
    gradle("assembleDebug");
    console.log("\n✔ APK: android/app/build/outputs/apk/debug/app-debug.apk");
    break;
  case "aab":
    init();
    gradle("bundleRelease");
    console.log("\n✔ Bundle: android/app/build/outputs/bundle/release/app-release.aab (sign it before uploading)");
    break;
  case "open":
    init();
    run("npx cap open android");
    break;
  default:
    console.log("Usage: node scripts/android.mjs init | apk | aab | open");
    process.exit(1);
}
