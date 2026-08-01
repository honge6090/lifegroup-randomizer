import Link from "next/link";
import SignupForm from "@/components/SignupForm";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-12">
      <header className="mb-8 text-center">
        <p className="text-[12px] font-semibold tracking-[0.18em] text-accent uppercase">
          Life Groups
        </p>
        <h1 className="mt-3 font-display text-[38px] leading-[1.1] font-semibold text-balance">
          Let&rsquo;s find your group.
        </h1>
        <p className="mx-auto mt-3 max-w-[19rem] text-[15px] leading-relaxed text-balance text-muted">
          Add your name below. Once everyone&rsquo;s in, we&rsquo;ll sort the
          room into small groups.
        </p>
      </header>

      <SignupForm />

      <p className="mt-8 text-center text-[14px] text-muted">
        Already signed up?{" "}
        <Link
          href="/groups"
          className="font-semibold text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-accent"
        >
          See the groups
        </Link>
      </p>
    </main>
  );
}
