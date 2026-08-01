"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  clearAllAction,
  createGroupsAction,
  deleteMemberAction,
  type AdminResult,
} from "@/app/actions";
import type { Member } from "@/lib/types";

type Props = {
  members: Member[];
  signupUrl: string;
  qrDataUrl: string;
};

export default function AdminConsole({ members, signupUrl, qrDataUrl }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<AdminResult | null>(null);
  const [confirmingClear, setConfirmingClear] = useState(false);

  const groupCount = new Set(
    members.map((m) => m.group_number).filter((n): n is number => n !== null),
  ).size;

  function run(action: () => Promise<AdminResult>) {
    startTransition(async () => {
      const result = await action();
      setNotice(result);
      router.refresh();
    });
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold tracking-[0.18em] text-accent uppercase">
            Organizer
          </p>
          <h1 className="mt-2 font-display text-[34px] leading-tight font-semibold">
            Life Group Admin
          </h1>
        </div>
        <Link
          href="/groups"
          className="rounded-xl border border-line bg-card px-4 py-2.5 text-[14px] font-semibold transition-colors hover:border-accent"
        >
          View public groups →
        </Link>
      </header>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Stat label="Signed up" value={members.length} />
        <Stat
          label="Groups made"
          value={groupCount}
          hint={groupCount === 0 ? "Not sorted yet" : undefined}
        />
      </div>

      {notice && (
        <p
          role="status"
          className={`mt-5 rounded-xl px-4 py-3 text-[14px] font-medium ${
            notice.ok
              ? "bg-accent-soft text-accent"
              : "bg-[#f7e7e7] text-danger"
          }`}
        >
          {notice.message}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending || members.length === 0}
          onClick={() => run(createGroupsAction)}
          className="rounded-xl bg-accent px-5 py-3.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending
            ? "Working…"
            : groupCount > 0
              ? "Re-roll the groups"
              : "Create life groups"}
        </button>

        <button
          type="button"
          disabled={pending || members.length === 0}
          onClick={() => setConfirmingClear(true)}
          className="rounded-xl border border-line bg-card px-5 py-3.5 text-[15px] font-semibold text-danger transition-colors hover:border-danger disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear all submissions
        </button>
      </div>

      <QrPanel signupUrl={signupUrl} qrDataUrl={qrDataUrl} />

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">
          Submissions{" "}
          <span className="font-sans text-[15px] font-normal text-muted">
            ({members.length})
          </span>
        </h2>

        {members.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-line bg-card/60 px-5 py-10 text-center text-[15px] text-muted">
            Nobody has signed up yet. Share the QR code to get started.
          </p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-card shadow-[0_1px_3px_rgba(33,29,24,0.06)]">
            <table className="w-full text-left text-[15px]">
              <thead>
                <tr className="border-b border-line text-[12px] tracking-wide text-muted uppercase">
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Group</th>
                  <th className="hidden px-5 py-3 font-semibold sm:table-cell">
                    Signed up
                  </th>
                  <th className="px-5 py-3">
                    <span className="sr-only">Remove</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-line last:border-0"
                  >
                    <td className="px-5 py-3.5 font-medium">
                      {member.first_name} {member.last_name}
                    </td>
                    <td className="px-5 py-3.5 text-muted">
                      {member.group_number ?? "—"}
                    </td>
                    <td className="hidden px-5 py-3.5 text-muted sm:table-cell">
                      {new Date(member.created_at).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          run(() => deleteMemberAction(member.id))
                        }
                        aria-label={`Remove ${member.first_name} ${member.last_name}`}
                        className="rounded-lg px-2 py-1 text-muted transition-colors hover:bg-[#f7e7e7] hover:text-danger disabled:opacity-40"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {confirmingClear && (
        <ClearDialog
          count={members.length}
          onCancel={() => setConfirmingClear(false)}
          onConfirm={() => {
            setConfirmingClear(false);
            run(clearAllAction);
          }}
        />
      )}
    </main>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-card px-5 py-4 shadow-[0_1px_3px_rgba(33,29,24,0.06)]">
      <p className="text-[12px] font-semibold tracking-wide text-muted uppercase">
        {label}
      </p>
      <p className="mt-1 font-display text-3xl font-semibold">{value}</p>
      {hint && <p className="mt-0.5 text-[13px] text-muted">{hint}</p>}
    </div>
  );
}

function QrPanel({
  signupUrl,
  qrDataUrl,
}: {
  signupUrl: string;
  qrDataUrl: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <section className="mt-8 rounded-2xl border border-line bg-card p-6 shadow-[0_1px_3px_rgba(33,29,24,0.06)] sm:p-7">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        {/* Plain img on purpose: the QR is an inline data URL, so there is
            nothing for the Next image optimizer to fetch or resize. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUrl}
          alt={`QR code linking to ${signupUrl}`}
          width={160}
          height={160}
          className="mx-auto h-40 w-40 shrink-0 rounded-xl border border-line sm:mx-0"
        />

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h2 className="font-display text-xl font-semibold">
            Scan to sign up
          </h2>
          <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
            Project this or print it. Scanning opens the name form.
          </p>

          <code className="mt-3 block truncate rounded-lg bg-paper px-3 py-2 text-[13px] text-muted">
            {signupUrl}
          </code>

          <div className="mt-4 flex flex-wrap justify-center gap-2.5 sm:justify-start">
            <a
              href={qrDataUrl}
              download="lifegroup-qr.png"
              className="rounded-xl bg-ink px-4 py-2.5 text-[14px] font-semibold text-paper transition-opacity hover:opacity-90"
            >
              Download PNG
            </a>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(signupUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="rounded-xl border border-line px-4 py-2.5 text-[14px] font-semibold transition-colors hover:border-accent"
            >
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Clearing wipes every submission and the page has no password, so this asks
 * for the word CLEAR rather than a single click that is easy to hit by accident.
 */
function ClearDialog({
  count,
  onCancel,
  onConfirm,
}: {
  count: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [typed, setTyped] = useState("");
  const matches = typed.trim().toUpperCase() === "CLEAR";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="clear-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-5 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-line bg-card p-6 shadow-xl"
      >
        <h2 id="clear-title" className="font-display text-xl font-semibold">
          Delete all {count} submissions?
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          This wipes the whole list and any groups you have made. It cannot be
          undone.
        </p>

        <label
          htmlFor="clear-confirm"
          className="mt-5 block text-[13px] font-semibold tracking-wide text-muted uppercase"
        >
          Type CLEAR to confirm
        </label>
        <input
          id="clear-confirm"
          value={typed}
          autoFocus
          onChange={(event) => setTyped(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && matches) onConfirm();
            if (event.key === "Escape") onCancel();
          }}
          className="mt-2 w-full rounded-xl border border-line bg-paper px-4 py-3 text-base focus:border-danger focus:outline-none"
        />

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-line px-4 py-3 text-[15px] font-semibold transition-colors hover:border-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!matches}
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-danger px-4 py-3 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Delete all
          </button>
        </div>
      </div>
    </div>
  );
}
