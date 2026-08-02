/**
 * The NSC mark, traced from the logo used by the NSC Preflight app.
 *
 * Inline SVG rather than a PNG so it stays sharp at any size and inherits the
 * surrounding text colour via `currentColor`, which means no filter tricks are
 * needed to show it dark on a light page.
 */

export const NSC_MARK_PATH =
  "M53.0,28.2 L97.9,35.4 L97.9,41.9 L55.1,47.2 L55.1,63.2 L32.8,76.1 L59.9,88.9 L59.9,98.4 L26.7,87.5 L26.7,63.1 L53.0,45.3 L53.0,28.2 Z M48.0,1.2 L48.2,1.2 L48.2,27.8 L37.7,25.4 L37.7,41.8 L1.8,33.3 L1.9,26.8 L34.5,22.9 L34.5,4.4 L48.0,1.2 Z";

export default function NscLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="NSC"
      fill="currentColor"
    >
      <path d={NSC_MARK_PATH} />
    </svg>
  );
}
