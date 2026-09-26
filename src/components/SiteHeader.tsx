import Link from "next/link";
import HavenWordmark from "./HavenWordmark";

/** Sticky header with the HAVEN lettering and the two public pages. */
export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-5">
        <Link href="/" className="flex items-center gap-2" aria-label="Haven 저녁 조 홈">
          <HavenWordmark size="sm" />
          <span className="font-hand text-sm text-muted-foreground">저녁 조</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            이름 등록
          </Link>
          <Link
            href="/groups"
            className="transition-colors hover:text-foreground"
          >
            조 확인
          </Link>
        </nav>
      </div>
    </header>
  );
}
