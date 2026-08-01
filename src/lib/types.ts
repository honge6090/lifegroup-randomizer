/**
 * Shared shapes. Kept apart from `members.ts` so client components can import
 * these types without pulling in the server-only Supabase module.
 */

export type Member = {
  id: string;
  first_name: string;
  last_name: string;
  group_number: number | null;
  created_at: string;
};

export type LifeGroup = {
  number: number;
  members: Member[];
};
