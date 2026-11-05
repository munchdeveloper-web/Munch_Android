import { useEffect, useState } from "react";
import { Download, PlusSquare, Share, X } from "lucide-react";
import logoMark from "@/assets/logo-mark.webp";
import { useApp } from "@/store";
import { useInstall, installRecentlyDismissed, rememberInstallDismissed } from "@/lib/pwa";

/** Fired by anything (e.g. the Profile "Install app" row) that wants the iPhone instructions. */
export const OPEN_INSTALL_HELP = "munch:install-help";

const SHOW_AFTER_MS = 10_000;

export function InstallPrompt() {
  const { installed, canPrompt, ios, install } = useInstall();
  const { notify } = useApp();
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(() => installRecentlyDismissed());
  const [helpOpen, setHelpOpen] = useState(false);

  // Don't greet people with an install ask the moment the app opens.
  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), SHOW_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const open = () => setHelpOpen(true);
    window.addEventListener(OPEN_INSTALL_HELP, open);
    return () => window.removeEventListener(OPEN_INSTALL_HELP, open);
  }, []);

  useEffect(() => {
    if (!helpOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setHelpOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [helpOpen]);

  const dismiss = () => {
    rememberInstallDismissed();
    setHidden(true);
  };

  const onInstall = async () => {
    if (canPrompt) {
      const outcome = await install();
      if (outcome === "accepted") notify("munch. is on your home screen");
      else dismiss();
      return;
    }
    if (ios) setHelpOpen(true);
  };

  const showBanner = ready && !hidden && !installed && (canPrompt || ios);

  return (
    <>
      {showBanner && (
        <aside className="install-banner" role="region" aria-label="Install munch.">
          <img className="install-banner__icon" src={logoMark} alt="" width={44} height={44} />
          <div className="install-banner__copy">
            <p className="install-banner__title">Get the munch. app</p>
            <p className="install-banner__sub">Full screen, faster, one tap from your home screen.</p>
          </div>
          <button type="button" className="btn btn--primary btn--sm install-banner__cta" onClick={onInstall}>
            <Download aria-hidden="true" /> {canPrompt ? "Install" : "Add"}
          </button>
          <button type="button" className="install-banner__close" onClick={dismiss} aria-label="Not now">
            <X aria-hidden="true" />
          </button>
        </aside>
      )}

      {helpOpen && (
        <div className="install-help" role="presentation" onClick={() => setHelpOpen(false)}>
          <div
            className="install-help__sheet card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-help-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="install-help__close"
              onClick={() => setHelpOpen(false)}
              aria-label="Close"
            >
              <X aria-hidden="true" />
            </button>
            <img src={logoMark} alt="" width={52} height={52} />
            <h2 id="install-help-title">Add munch. to your home screen</h2>
            <ol className="install-help__steps">
              <li>
                <span className="install-help__num">1</span>
                <span>
                  Tap the <Share aria-hidden="true" className="install-help__glyph" /> <strong>Share</strong> button in
                  Safari's toolbar.
                </span>
              </li>
              <li>
                <span className="install-help__num">2</span>
                <span>
                  Scroll down and tap <PlusSquare aria-hidden="true" className="install-help__glyph" />{" "}
                  <strong>Add to Home Screen</strong>.
                </span>
              </li>
              <li>
                <span className="install-help__num">3</span>
                <span>
                  Tap <strong>Add</strong>. munch. now opens like any other app.
                </span>
              </li>
            </ol>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                setHelpOpen(false);
                dismiss();
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
