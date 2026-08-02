import Link from "next/link";
import NscLogo from "./NscLogo";

/**
 * Sticky header mirroring the NSC Preflight one: same height, same border and
 * blur, and the mark at the same size.
 */
export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <NscLogo className="h-5 w-5 text-foreground" />
          Life Group Bungae
        </Link>

        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            Sign up
          </Link>
          <Link
            href="/groups"
            className="transition-colors hover:text-foreground"
          >
            Groups
          </Link>
        </nav>
      </div>
    </header>
  );
}
