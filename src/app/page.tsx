import Link from "next/link";
import HavenWordmark from "@/components/HavenWordmark";
import SignupForm from "@/components/SignupForm";

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-md px-6 py-12 sm:py-16">
      <header className="mb-10 text-center">
        <HavenWordmark tagline />

        <h1 className="mt-10 font-hand text-3xl text-balance sm:text-4xl">
          저녁 식사 조 뽑기
        </h1>
        <p className="mt-1 text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Dinner Groups
        </p>
        <p className="mx-auto mt-4 max-w-[21rem] text-[15px] leading-relaxed text-balance text-muted-foreground">
          예배 후 함께 저녁 먹을 조를 랜덤으로 정해요. 이름을 적어 주시면
          4명씩 한 테이블로 짝지어 드릴게요.
        </p>
      </header>

      <SignupForm />

      <p className="mt-8 text-center text-sm text-muted-foreground">
        이미 등록하셨나요?{" "}
        <Link
          href="/groups"
          className="font-medium text-foreground underline decoration-primary decoration-2 underline-offset-4 transition-colors hover:text-primary"
        >
          조 확인하기
        </Link>
      </p>
    </main>
  );
}
