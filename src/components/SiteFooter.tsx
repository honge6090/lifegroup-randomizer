import NscLogo from "./NscLogo";

/** The sign-off from the bottom of the bulletin: 헤이븐 · NSC mark · 한국어예배. */
export default function SiteFooter() {
  return (
    <footer className="mt-auto py-10">
      <p className="flex items-center justify-center gap-3 font-hand text-lg text-foreground">
        <span>헤이븐</span>
        <NscLogo className="h-6 w-6" />
        <span>한국어예배</span>
      </p>
    </footer>
  );
}
