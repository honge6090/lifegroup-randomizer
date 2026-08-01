"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { submitMemberAction, type SignupState } from "@/app/actions";

const initialState: SignupState = { status: "idle" };

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(
    submitMemberAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // Clear the fields once a submission lands so the next person can go straight in.
  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-line bg-card p-8 text-center shadow-[0_1px_3px_rgba(33,29,24,0.06)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-7 w-7 text-accent"
            aria-hidden="true"
          >
            <path
              d="m5 13 4 4L19 7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 className="mt-5 font-display text-2xl font-semibold">
          You&rsquo;re in, {state.firstName}.
        </h2>
        <p className="mx-auto mt-2 max-w-xs text-[15px] leading-relaxed text-muted">
          We&rsquo;ll sort everyone into groups once sign-ups close. Check back
          on the groups page to find yours.
        </p>

        <Link
          href="/groups"
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-ink px-5 py-3.5 text-[15px] font-semibold text-paper transition-opacity hover:opacity-90"
        >
          See the groups
        </Link>

        <button
          type="button"
          onClick={() => {
            formRef.current?.reset();
            window.location.reload();
          }}
          className="mt-3 w-full rounded-xl px-5 py-2.5 text-[15px] font-medium text-muted transition-colors hover:text-ink"
        >
          Sign up someone else
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-2xl border border-line bg-card p-6 shadow-[0_1px_3px_rgba(33,29,24,0.06)] sm:p-8"
    >
      <div className="space-y-5">
        <Field
          ref={firstFieldRef}
          name="first_name"
          label="First name"
          autoComplete="given-name"
        />
        <Field name="last_name" label="Last name" autoComplete="family-name" />
      </div>

      {state.status === "error" && (
        <p
          role="alert"
          className="mt-5 rounded-xl bg-accent-soft px-4 py-3 text-[14px] leading-relaxed text-accent"
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-7 w-full rounded-xl bg-accent px-5 py-4 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Adding you…" : "Count me in"}
      </button>
    </form>
  );
}

function Field({
  ref,
  name,
  label,
  autoComplete,
}: {
  ref?: React.Ref<HTMLInputElement>;
  name: string;
  label: string;
  autoComplete: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-[13px] font-semibold tracking-wide text-muted uppercase"
      >
        {label}
      </label>
      <input
        ref={ref}
        id={name}
        name={name}
        type="text"
        required
        maxLength={60}
        autoComplete={autoComplete}
        // 16px minimum keeps iOS from zooming the page on focus.
        className="w-full rounded-xl border border-line bg-paper px-4 py-3.5 text-base text-ink transition-colors placeholder:text-muted/60 focus:border-accent focus:bg-card focus:outline-none"
      />
    </div>
  );
}
