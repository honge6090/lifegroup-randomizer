"use server";

import { revalidatePath } from "next/cache";
import {
  addMember,
  clearAllMembers,
  deleteMember,
  randomizeGroups,
} from "@/lib/members";

export type SignupState =
  | { status: "idle" }
  | { status: "success"; firstName: string }
  | { status: "error"; message: string };

export async function submitMemberAction(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const first = String(formData.get("first_name") ?? "");
  const last = String(formData.get("last_name") ?? "");

  const result = await addMember(first, last);
  if (!result.ok) return { status: "error", message: result.message };

  revalidatePath("/admin");
  return { status: "success", firstName: result.firstName };
}

export type AdminResult = { ok: boolean; message: string };

export async function createGroupsAction(): Promise<AdminResult> {
  const result = await randomizeGroups();
  revalidatePath("/admin");
  revalidatePath("/groups");
  return result;
}

export async function clearAllAction(): Promise<AdminResult> {
  const result = await clearAllMembers();
  revalidatePath("/admin");
  revalidatePath("/groups");
  return result;
}

export async function deleteMemberAction(id: string): Promise<AdminResult> {
  const result = await deleteMember(id);
  revalidatePath("/admin");
  revalidatePath("/groups");
  return result;
}
