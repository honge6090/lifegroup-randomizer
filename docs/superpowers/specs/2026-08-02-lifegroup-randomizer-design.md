# Life Group Randomizer — Design

Date: 2026-08-02

## Problem

Church members need to be sorted into life groups on the spot. Someone projects
a QR code, members scan it and type their name, and an organizer shuffles
everyone into groups of four or five.

## Scope

Three pages, one table, no accounts.

| Route     | Audience  | Purpose                                                             |
| --------- | --------- | ------------------------------------------------------------------- |
| `/`       | Members   | First name, last name, submit. QR code target.                       |
| `/admin`  | Organizer | Roster, create/re-roll groups, clear all, per-row delete, QR panel.  |
| `/groups` | Public    | Finished groups.                                                     |

Out of scope: accounts, editing names after submission, exporting to a
spreadsheet, multiple concurrent events, notifying members.

## Decisions

These were settled with the user before implementation.

1. **The admin page is unprotected.** No password, no secret path. The user chose
   this knowing anyone with the link can re-roll or wipe the roster. The one
   guardrail kept is a type-to-confirm dialog on "Clear all".
2. **Results are public.** Groups save to the database and render at `/groups`,
   so members can scan the same QR and find themselves.
3. **The app is reusable.** "Clear all submissions" wipes the roster so the next
   round starts fresh. Re-rolling replaces groups rather than topping them up.

## Grouping rule

Target five per group, fall back to four. For `n` members, make `ceil(n / 5)`
groups, then hand out members as evenly as possible.

```
20 → 5,5,5,5     13 → 5,4,4      17 → 5,4,4,4
23 → 5,5,5,4,4   11 → 4,4,3      7  → 4,3
```

Properties this guarantees, all covered by tests over `n = 1..400`:

- No group ever exceeds five.
- Sizes never differ by more than one, so no leftover group of one.
- Sizes always sum back to `n`.
- For `n >= 4`, no group is smaller than three.

Known rough edge: small turnouts split rather than staying together. Six people
become 3 + 3 rather than one group of six. Accepted, since the cap of five is the
more important property.

Shuffling is Fisher-Yates seeded from `crypto.getRandomValues`. The `random`
parameter is injectable so tests can be deterministic.

## Architecture

Next.js 15 App Router, React 19, Tailwind v4, Supabase Postgres, on Vercel.

```
src/lib/grouping.ts   pure algorithm, no I/O, fully unit tested
src/lib/types.ts      shared types, safe for client components
src/lib/supabase.ts   service-role client, guarded by `server-only`
src/lib/members.ts    data access: list, add, randomize, clear, delete
src/app/actions.ts    "use server" wrappers + cache revalidation
```

The split matters: `grouping.ts` holds the logic worth testing and touches
nothing external, so its tests need no database. `members.ts` is the only module
that knows Supabase exists. `types.ts` exists so client components can import
`Member` without dragging in the server-only Supabase module.

### Security model

The browser never talks to Supabase. Row level security on `lifegroup_members`
is enabled with **no public policies**, and all access flows through server
actions using the secret key. The `server-only` import in `supabase.ts` turns an
accidental client-side import into a build error rather than a leaked key.

An earlier session had left fully permissive `anon` policies (insert, select,
update, delete all `true`) on the table. Those are dropped as part of this work:
the app does not need them, and they would let anyone holding the publishable
key read or wipe the table straight through the REST API.

This does not make `/admin` safe from someone who has the link. It limits the
damage to people who actually find that page.

### Data

Existing table, reused unchanged:

| Column         | Type          | Notes                          |
| -------------- | ------------- | ------------------------------ |
| `id`           | `uuid`        | Primary key.                   |
| `first_name`   | `text`        |                                |
| `last_name`    | `text`        |                                |
| `group_number` | `int4` `null` | `null` until groups are made.  |
| `created_at`   | `timestamptz` | Sign-up order.                 |

Randomizing reads every row, computes assignments, and writes them back in a
single `upsert`. Fine at church scale; would need batching in the thousands.

### QR code

Generated server-side per request with the `qrcode` package, as a data URL. The
target origin comes from the request headers (`x-forwarded-host` / `host`), so
the same code works on localhost and production with nothing hardcoded.

## Error handling

- Empty or whitespace-only names are rejected before hitting the database.
- Duplicate sign-ups (same first and last name, ignoring case and extra spaces)
  get a friendly message instead of a second row.
- Names over 60 characters are rejected.
- Randomizing an empty roster reports "No one has signed up yet" rather than
  failing.
- Supabase errors surface as readable messages on the page, not stack traces.
- Missing environment variables throw a named error naming the missing vars.

## Testing

`src/lib/grouping.test.ts` runs under `node --test` using Node's native
TypeScript stripping, so no test framework dependency. Coverage is the grouping
invariants above plus shuffle behaviour (no mutation, no dropped members,
actually reorders).

The pages and data layer are verified by running the real app against the real
database rather than by mocking Supabase.
