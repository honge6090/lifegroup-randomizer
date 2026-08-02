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
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Admin
        </h1>
        <Link
          href="/groups"
          className="rounded-lg border border-border px-3.5 py-2 text-sm font-medium transition-colors hover:bg-secondary"
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
          className={`mt-5 rounded-lg border px-4 py-3 text-sm font-medium ${
            notice.ok
              ? "border-border bg-secondary text-foreground"
              : "border-destructive/25 bg-destructive-soft text-destructive"
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
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive-soft disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear all submissions
        </button>
      </div>

      <QrPanel signupUrl={signupUrl} qrDataUrl={qrDataUrl} />

      <section className="mt-10">
        <h2 className="font-semibold tracking-tight">
          Submissions{" "}
          <span className="font-normal text-muted-foreground">
            ({members.length})
          </span>
        </h2>

        {members.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border px-5 py-10 text-center text-[15px] text-muted-foreground">
            Nobody has signed up yet. Share the QR code to get started.
          </p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-[15px]">
              <thead>
                <tr className="border-b border-border bg-secondary text-xs tracking-wide text-muted-foreground uppercase">
                  <th className="px-5 py-2.5 font-medium">Name</th>
                  <th className="px-5 py-2.5 font-medium">Group</th>
                  <th className="hidden px-5 py-2.5 font-medium sm:table-cell">
                    Signed up
                  </th>
                  <th className="px-5 py-2.5">
                    <span className="sr-only">Remove</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-5 py-3 font-medium">
                      {member.first_name} {member.last_name}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {member.group_number ?? "—"}
                    </td>
                    <td className="hidden px-5 py-3 text-muted-foreground sm:table-cell">
                      {new Date(member.created_at).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => run(() => deleteMemberAction(member.id))}
                        aria-label={`Remove ${member.first_name} ${member.last_name}`}
                        className="rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-destructive-soft hover:text-destructive disabled:opacity-40"
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
    <div className="rounded-xl border border-border bg-card px-5 py-4">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>}
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
    <section className="mt-8 rounded-xl border border-border bg-card p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        {/* Plain img on purpose: the QR is an inline data URL, so there is
            nothing for the Next image optimizer to fetch or resize. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUrl}
          alt={`QR code linking to ${signupUrl}`}
          width={160}
          height={160}
          className="mx-auto h-40 w-40 shrink-0 rounded-lg border border-border sm:mx-0"
        />

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h2 className="font-semibold tracking-tight">Scan to sign up</h2>
          <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">
            Project this or print it. Scanning opens the name form.
          </p>

          <code className="mt-3 block truncate rounded-md bg-secondary px-3 py-2 text-xs text-muted-foreground">
            {signupUrl}
          </code>

          <div className="mt-4 flex flex-wrap justify-center gap-2.5 sm:justify-start">
            <a
              href={qrDataUrl}
              download="lifegroup-bungae-qr.png"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
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
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-5 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg"
      >
        <h2 id="clear-title" className="font-semibold tracking-tight">
          Delete all {count} submissions?
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          This wipes the whole list and any groups you have made. It cannot be
          undone.
        </p>

        <label
          htmlFor="clear-confirm"
          className="mt-5 block text-sm font-medium"
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
          className="mt-2 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-base focus:border-destructive focus:outline-none"
        />

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!matches}
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-destructive px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Delete all
          </button>
        </div>
      </div>
    </div>
  );
}
