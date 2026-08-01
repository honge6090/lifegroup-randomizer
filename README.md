# Life Group Randomizer

A small web app for sorting whoever shows up into life groups. Members scan a QR
code, type their name, and the organizer shuffles everyone into groups of four or
five.

## Pages

| Route     | Who it's for | What it does                                                                   |
| --------- | ------------ | ------------------------------------------------------------------------------ |
| `/`       | Members      | First name, last name, submit. This is where the QR code points.                |
| `/admin`  | Organizer    | Roster, create or re-roll groups, clear everything, and the QR code to project. |
| `/groups` | Everyone     | The finished groups.                                                            |

The admin page is intentionally unprotected. Anyone with the link can re-roll or
clear the roster, so treat `/admin` as a private link. Clearing sits behind a
type-to-confirm dialog so it is hard to trigger by accident.

## How grouping works

The target is five per group, falling back to four. For `n` people the app makes
`ceil(n / 5)` groups and spreads everyone as evenly as possible, so sizes never
differ by more than one:

```
20 → 5,5,5,5     13 → 5,4,4      17 → 5,4,4,4
23 → 5,5,5,4,4   11 → 4,4,3      7  → 4,3
```

Shuffling is Fisher-Yates seeded from `crypto.getRandomValues`, so every re-roll
is genuinely different. Re-rolling replaces the previous groups entirely rather
than topping them up.

The logic lives in [`src/lib/grouping.ts`](src/lib/grouping.ts) as pure
functions, and is covered by tests in `src/lib/grouping.test.ts`.

## Setup

```bash
npm install
cp .env.example .env.local   # then paste your Supabase secret key
npm run dev
```

### Environment variables

| Name                        | Notes                                                      |
| --------------------------- | ---------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`  | Supabase project URL.                                      |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key (`sb_secret_...`). Server-side only.            |

The browser never talks to Supabase directly. Row level security on
`lifegroup_members` stays locked with no public policies, and every read and
write goes through a Next.js server action using the secret key. The
`server-only` import in `src/lib/supabase.ts` turns any accidental client import
into a build error.

## Commands

```bash
npm run dev     # local dev server
npm test        # grouping unit tests
npm run build   # production build
```

## Data

One table, `lifegroup_members`:

| Column         | Type          | Notes                                    |
| -------------- | ------------- | ---------------------------------------- |
| `id`           | `uuid`        | Primary key.                             |
| `first_name`   | `text`        |                                          |
| `last_name`    | `text`        |                                          |
| `group_number` | `int4 | null` | `null` until the organizer sorts groups. |
| `created_at`   | `timestamptz` | Sign-up order.                           |

Duplicate sign-ups are rejected by comparing first and last name with casing and
extra spaces ignored.

## Stack

Next.js 15 (App Router), React 19, Tailwind CSS v4, Supabase Postgres, deployed
on Vercel.
