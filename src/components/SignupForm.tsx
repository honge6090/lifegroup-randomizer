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

  // Clear the fields once a submission lands so the next person can go straight in.
  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  if (state.status === "success") {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-6 w-6 text-primary-foreground"
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

        <h2 className="mt-5 font-hand text-2xl">
          {state.firstName}님, 환영해요!
        </h2>
        <p className="mx-auto mt-3 max-w-xs text-[15px] leading-relaxed text-muted-foreground">
          등록이 끝나면 조를 뽑을게요. 조 확인 페이지에서 내 테이블을
          찾아보세요.
        </p>

        <Link
          href="/groups"
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          조 확인하기
        </Link>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 w-full rounded-lg px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          다른 사람 등록하기
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-7"
    >
      <div className="space-y-4">
        <Field
          name="first_name"
          label="이름"
          hint="First name"
          autoComplete="given-name"
        />
        <Field
          name="last_name"
          label="성"
          hint="Last name"
          autoComplete="family-name"
        />
      </div>

      {state.status === "error" && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-destructive/25 bg-destructive-soft px-4 py-3 text-sm leading-relaxed text-destructive"
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 w-full rounded-lg bg-primary px-5 py-3.5 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "등록 중…" : "등록하기"}
      </button>
    </form>
  );
}

function Field({
  name,
  label,
  hint,
  autoComplete,
}: {
  name: string;
  label: string;
  hint: string;
  autoComplete: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-medium">
        {label}{" "}
        <span className="font-normal text-muted-foreground">{hint}</span>
      </label>
      <input
        id={name}
        name={name}
        type="text"
        required
        maxLength={60}
        autoComplete={autoComplete}
        // 16px minimum keeps iOS from zooming the page on focus.
        className="w-full rounded-lg border border-input bg-background px-3.5 py-3 text-base transition-colors focus:border-ring focus:outline-none"
      />
    </div>
  );
}
