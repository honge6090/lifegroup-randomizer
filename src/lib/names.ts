/**
 * How a member's name is shown. Korean names read family name first with no
 * space (김민수), so when both parts are written in Hangul we follow that;
 * everything else keeps the "First Last" order.
 */
const HANGUL = /[가-힣]/;

export function displayName(first: string, last: string): string {
  if (HANGUL.test(first) && HANGUL.test(last)) return `${last}${first}`;
  return `${first} ${last}`;
}
