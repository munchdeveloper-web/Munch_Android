import type { CSSProperties } from "react";

/**
 * Paper skeletons. Shapes match the real components closely enough that the
 * swap does not shift layout, and shimmer only animates a background gradient
 * (transform-free, cheap on low-end phones, disabled by reduced-motion).
 */
export function SkeletonBlock({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return <span className={`sk-block ${className}`.trim()} style={style} aria-hidden="true" />;
}

export function SkeletonLine({
  width = "100%",
  height = 12,
  className = "",
}: {
  width?: string | number;
  height?: number;
  className?: string;
}) {
  return (
    <span
      className={`sk-line ${className}`.trim()}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

/**
 * Loading state for the swipe deck. It is built from the SAME classes and DOM shape as the real
 * card (deck-wrap → deck-card → media + body, then vote-row + vote-note), with invisible
 * placeholder text inside, so the card, buttons and caption occupy exactly the space they will
 * once the data arrives. Nothing jumps when loading ends.
 */
export function DeckSkeleton() {
  return (
    <>
      <div className="deck-wrap" aria-busy="true">
        <span className="deck-sheet" aria-hidden="true" />
        <span className="deck-sheet deck-sheet--blush" aria-hidden="true" />
        <span className="deck-sheet deck-sheet--sage" aria-hidden="true" />
        <div className="deck-card deck-card--ghost" role="status">
          <span className="sr-only">Finding restaurants near you</span>
          <div className="deck-card__media sk-shimmer" aria-hidden="true">
            <div className="deck-card__top">
              <span className="pill pill--plain sk-ghost-pill">0.0 mi</span>
              <span className="pill pill--plain sk-ghost-pill">Cuisine</span>
            </div>
            <div className="deck-card__bottom">
              <div style={{ minWidth: 0 }}>
                <span className="deck-card__status sk-ghost">Hours unavailable</span>
                <h2 className="deck-card__name sk-ghost sk-ghost--title">Restaurant name</h2>
              </div>
              <span className="save-btn sk-ghost-round" />
            </div>
          </div>
          <div className="deck-card__body" aria-hidden="true">
            <div className="deck-card__tags">
              <span className="tag sk-ghost">Cuisine</span>
              <span className="tag sk-ghost">Restaurant</span>
            </div>
            <div className="deck-card__meta">
              <span className="sk-ghost">Street address 00</span>
            </div>
            <span className="deck-card__details sk-ghost-block">Peek at the menu, hours &amp; map →</span>
          </div>
        </div>
      </div>

      <div className="vote-row" aria-hidden="true">
        <span className="roundbtn roundbtn--no sk-ghost-round" />
        <span className="roundbtn roundbtn--undo sk-ghost-round" />
        <span className="roundbtn roundbtn--boost sk-ghost-round" />
        <span className="roundbtn roundbtn--yes sk-ghost-round" />
      </div>
      <p className="vote-note" aria-hidden="true">
        <span className="sk-ghost">1 super-bite left</span>
      </p>
    </>
  );
}

export function ListSkeleton({
  rows = 4,
  media = true,
}: {
  rows?: number;
  media?: boolean;
}) {
  return (
    <div className="sk-list" aria-busy="true" role="status">
      <span className="sr-only">Loading your list</span>
      {Array.from({ length: rows }).map((_, index) => (
        <div className="sk-row" key={index} style={{ animationDelay: `${index * 90}ms` }}>
          {media && <SkeletonBlock className="sk-row__media" />}
          <div className="sk-row__body">
            <SkeletonLine width={`${58 + ((index * 11) % 28)}%`} height={14} />
            <SkeletonLine width={`${34 + ((index * 7) % 26)}%`} height={10} />
            <SkeletonLine width="26%" height={9} />
          </div>
          <SkeletonBlock className="sk-row__pill" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="sk-page" aria-busy="true" role="status">
      <span className="sr-only">Loading</span>
      <div className="sk-page__head">
        <SkeletonLine width={140} height={10} />
        <SkeletonLine width={260} height={34} className="sk-line--title" />
        <SkeletonLine width={200} height={11} />
      </div>
      <div className="sk-stat-row">
        <SkeletonBlock className="sk-stat" />
        <SkeletonBlock className="sk-stat" />
        <SkeletonBlock className="sk-stat" />
      </div>
      <ListSkeleton rows={rows} />
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="sk-map" aria-busy="true" role="status">
      <span className="sr-only">Loading the map</span>
      <div className="sk-map__grid" aria-hidden="true" />
      <span className="sk-map__pin" style={{ left: "28%", top: "34%" }} aria-hidden="true" />
      <span className="sk-map__pin" style={{ left: "63%", top: "26%" }} aria-hidden="true" />
      <span className="sk-map__pin" style={{ left: "48%", top: "62%" }} aria-hidden="true" />
      <div className="sk-map__bar">
        <SkeletonLine width={120} height={10} />
        <SkeletonLine width={70} height={10} />
      </div>
    </div>
  );
}
