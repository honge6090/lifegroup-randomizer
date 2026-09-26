# Haven Dinner Groups

A small web app for sorting everyone at Haven (헤이븐 한국어예배) into random dinner
tables after worship. People scan a QR code, type their name, and the organizer
shuffles everyone into tables of four, with leftovers seated in threes.

The look follows the Haven bulletin: ruled notebook paper, the orange HAVEN brush
lettering (`public/haven-wordmark.png`, cut from the bulletin artwork) and the
UhBee DongKyung hand-lettered face (`src/fonts/`) for headings.

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

The target is four per table, with leftovers absorbed into tables of three. For
`n` people the app makes `ceil(n / 4)` tables and spreads everyone as evenly as
possible, so every table has four or three people:

```
8  → 4,4        7  → 4,3        10 → 4,3,3
11 → 4,4,3      13 → 4,3,3,3    6  → 3,3
```

Five is the one count that cannot be split into fours and threes, so it stays as
a single table of five rather than becoming 3 and 2.

Shuffling is Fisher-Yates seeded from `crypto.getRandomValues`, so every re-roll
is genuinely different. Re-rolling replaces the previous groups entirely rather
than topping them up.

The logic lives in [`src/lib/grouping.ts`](src/lib/grouping.ts) as pure
functions, and is covered by tests in `src/lib/grouping.test.ts`.

Names written in Hangul are shown family name first with no space (김민수);
other names stay in First Last order. See `src/lib/names.ts`.

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
npm test        # grouping and name unit tests
npm run build   # production build
```

## Data

One table, `lifegroup_members` (the name is kept from the original life group
version so the existing Supabase project keeps working):

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
