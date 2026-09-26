import Link from "next/link";
import { listGroups } from "@/lib/members";
import { displayName } from "@/lib/names";

// Group data changes whenever the admin re-rolls, so never serve this from cache.
export const dynamic = "force-dynamic";

export default async function GroupsPage() {
  const groups = await listGroups();
  const total = groups.reduce((sum, g) => sum + g.members.length, 0);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
      <header className="text-center">
        <h1 className="font-hand text-3xl sm:text-4xl">
          {groups.length > 0 ? "오늘의 저녁 식탁" : "저녁 식사 조"}
        </h1>
        <p className="mt-1 text-sm font-medium tracking-wide text-muted-foreground uppercase">
          {groups.length > 0 ? "Tonight's tables" : "Dinner groups"}
        </p>
        {groups.length > 0 && (
          <p className="mt-4 text-[15px] text-muted-foreground">
            {total}명 · {groups.length}개 조 · 맛있게 드세요!
          </p>
        )}
      </header>

      {groups.length === 0 ? (
        <div className="mx-auto mt-10 max-w-sm rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="font-hand text-xl">아직 조를 뽑지 않았어요.</p>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            조가 정해지면 여기에 나와요. 잠시 후에 다시 확인해 주세요.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            이름 등록하기
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {groups.map((group) => (
            <section
              key={group.number}
              className="rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">
                  {group.number}
                </span>
                <div>
                  <h2 className="text-lg font-bold">{group.number}조</h2>
                  <p className="text-sm text-muted-foreground">
                    {group.members.length}명
                  </p>
                </div>
              </div>

              <ul className="mt-5 space-y-2.5 border-t border-dashed border-border pt-5">
                {group.members.map((member) => (
                  <li key={member.id} className="font-hand text-lg">
                    {displayName(member.first_name, member.last_name)}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
