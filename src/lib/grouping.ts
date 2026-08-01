/**
 * Group-splitting rules for life groups.
 *
 * Everything here is pure so it can be tested without a database.
 * The target is five per group, falling back to four, and the sizes are
 * always spread as evenly as possible so nobody ends up in a group of one.
 */

export const TARGET_GROUP_SIZE = 5;

/**
 * Work out how big each group should be for a given number of members.
 *
 * We make ceil(n / 5) groups and then hand out members as evenly as we can.
 * That caps every group at five and keeps the sizes within one of each other,
 * so 13 people become 5/4/4 rather than 5/5/3.
 */
export function partitionSizes(memberCount: number): number[] {
  if (memberCount <= 0) return [];

  const groupCount = Math.ceil(memberCount / TARGET_GROUP_SIZE);
  const base = Math.floor(memberCount / groupCount);
  const leftover = memberCount % groupCount;

  // The first `leftover` groups take one extra member each.
  return Array.from({ length: groupCount }, (_, i) =>
    i < leftover ? base + 1 : base,
  );
}

/** A random float in [0, 1) drawn from the platform's CSPRNG. */
function cryptoRandom(): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0] / 2 ** 32;
}

/**
 * Fisher-Yates shuffle. Returns a new array and leaves the input alone.
 * The `random` parameter exists so tests can feed in a predictable sequence.
 */
export function shuffle<T>(items: T[], random: () => number = cryptoRandom): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export type Assignable = { id: string };
export type Assignment = { id: string; group_number: number };

/**
 * Shuffle the roster and cut it into groups, returning each member's id
 * paired with their group number (numbered from 1).
 */
export function assignGroups<T extends Assignable>(
  members: T[],
  random: () => number = cryptoRandom,
): Assignment[] {
  const shuffled = shuffle(members, random);
  const sizes = partitionSizes(shuffled.length);

  const assignments: Assignment[] = [];
  let cursor = 0;

  sizes.forEach((size, index) => {
    for (const member of shuffled.slice(cursor, cursor + size)) {
      assignments.push({ id: member.id, group_number: index + 1 });
    }
    cursor += size;
  });

  return assignments;
}
