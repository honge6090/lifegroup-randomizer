import "server-only";
import { supabaseAdmin } from "./supabase";
import { assignGroups } from "./grouping";

import type { LifeGroup, Member } from "./types";

export type { LifeGroup, Member };

const TABLE = "lifegroup_members";

/** Collapse spacing and case so "Ann  Kim" and "ann kim" count as the same person. */
function nameKey(first: string, last: string): string {
  return `${first.trim().toLowerCase().replace(/\s+/g, " ")}|${last
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")}`;
}

/** Tidy up what someone typed without changing who they are. */
function cleanName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export async function listMembers(): Promise<Member[]> {
  const { data, error } = await supabaseAdmin()
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Could not load submissions: ${error.message}`);
  return (data ?? []) as Member[];
}

/** Members that have been sorted into a group, bundled up by group number. */
export async function listGroups(): Promise<LifeGroup[]> {
  const members = await listMembers();
  const grouped = new Map<number, Member[]>();

  for (const member of members) {
    if (member.group_number === null) continue;
    const bucket = grouped.get(member.group_number) ?? [];
    bucket.push(member);
    grouped.set(member.group_number, bucket);
  }

  return [...grouped.entries()]
    .sort(([a], [b]) => a - b)
    .map(([number, groupMembers]) => ({ number, members: groupMembers }));
}

export async function addMember(
  firstName: string,
  lastName: string,
): Promise<{ ok: true; firstName: string } | { ok: false; message: string }> {
  const first = cleanName(firstName);
  const last = cleanName(lastName);

  if (!first || !last) {
    return { ok: false, message: "이름과 성을 모두 입력해 주세요." };
  }
  if (first.length > 60 || last.length > 60) {
    return { ok: false, message: "이름이 너무 길어요." };
  }

  const existing = await listMembers();
  const key = nameKey(first, last);
  if (existing.some((m) => nameKey(m.first_name, m.last_name) === key)) {
    return {
      ok: false,
      message: `${first}님은 이미 등록되어 있어요. 조 확인 페이지에서 확인해 주세요.`,
    };
  }

  const { error } = await supabaseAdmin()
    .from(TABLE)
    .insert({ first_name: first, last_name: last, group_number: null });

  if (error) return { ok: false, message: `저장하지 못했어요: ${error.message}` };
  return { ok: true, firstName: first };
}

/**
 * Shuffle everyone who has signed up and write their new group numbers.
 *
 * Existing group numbers are ignored, so running this again is a full re-roll
 * rather than a top-up.
 */
export async function randomizeGroups(): Promise<{
  ok: boolean;
  message: string;
}> {
  const members = await listMembers();
  if (members.length === 0) {
    return { ok: false, message: "아직 등록한 사람이 없어요." };
  }

  const assignments = new Map(
    assignGroups(members).map((a) => [a.id, a.group_number]),
  );

  const updated = members.map((member) => ({
    ...member,
    group_number: assignments.get(member.id) ?? null,
  }));

  const { error } = await supabaseAdmin().from(TABLE).upsert(updated);
  if (error) {
    return { ok: false, message: `조를 저장하지 못했어요: ${error.message}` };
  }

  const groupCount = new Set(assignments.values()).size;
  return {
    ok: true,
    message: `${members.length}명을 ${groupCount}개 조로 나눴어요.`,
  };
}

export async function clearAllMembers(): Promise<{
  ok: boolean;
  message: string;
}> {
  const { error } = await supabaseAdmin()
    .from(TABLE)
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (error) return { ok: false, message: `삭제하지 못했어요: ${error.message}` };
  return { ok: true, message: "모두 삭제했어요." };
}

export async function deleteMember(
  id: string,
): Promise<{ ok: boolean; message: string }> {
  const { error } = await supabaseAdmin().from(TABLE).delete().eq("id", id);
  if (error) return { ok: false, message: `삭제하지 못했어요: ${error.message}` };
  return { ok: true, message: "삭제했어요." };
}
