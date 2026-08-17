import { supabase } from "@/lib/supabaseClient";
import { Garment, SavedLook, StyleOccasion } from "@/types/tryOn";

/** Shape of a row in the public.saved_looks table (see supabase/schema.sql). */
interface SavedLookRow {
  id: string;
  user_id: string;
  result_image: string;
  before_image: string;
  garment: Garment;
  style: string | null;
  favorite: boolean;
  created_at: string;
}

function rowToSavedLook(row: SavedLookRow): SavedLook {
  return {
    id: row.id,
    resultImage: row.result_image,
    beforeImage: row.before_image,
    garment: row.garment,
    style: (row.style as StyleOccasion) ?? undefined,
    createdAt: row.created_at,
    favorite: row.favorite,
  };
}

export async function fetchSavedLooks(userId: string): Promise<SavedLook[]> {
  const { data, error } = await supabase
    .from("saved_looks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as SavedLookRow[]).map(rowToSavedLook);
}

export async function insertSavedLook(
  userId: string,
  look: Omit<SavedLook, "id" | "createdAt" | "favorite">
): Promise<SavedLook> {
  const { data, error } = await supabase
    .from("saved_looks")
    .insert({
      user_id: userId,
      result_image: look.resultImage,
      before_image: look.beforeImage,
      garment: look.garment,
      style: look.style ?? null,
      favorite: false,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return rowToSavedLook(data as SavedLookRow);
}

export async function setSavedLookFavorite(id: string, favorite: boolean): Promise<void> {
  const { error } = await supabase.from("saved_looks").update({ favorite }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteSavedLook(id: string): Promise<void> {
  const { error } = await supabase.from("saved_looks").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
