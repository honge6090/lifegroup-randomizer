import Link from "next/link";
import SignupForm from "@/components/SignupForm";

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-12 sm:py-16">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Life Group Bungae
        </h1>
        <p className="mx-auto mt-3 max-w-[20rem] text-[15px] leading-relaxed text-balance text-muted-foreground">
          Add your name below. Once everyone&rsquo;s in, we&rsquo;ll sort the
          room into groups of four or five.
        </p>
      </header>

      <SignupForm />

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already signed up?{" "}
        <Link
          href="/groups"
          className="font-medium text-foreground underline underline-offset-4 decoration-border transition-colors hover:decoration-foreground"
        >
          See the groups
        </Link>
      </p>
    </main>
  );
}
