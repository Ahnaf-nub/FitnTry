import { supabase } from "@/lib/supabaseClient";

export interface Shop {
  id: string;
  userId: string | null;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface ShopRow {
  id: string;
  user_id: string | null;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

function rowToShop(row: ShopRow): Shop {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
  };
}

/** Public directory — every shop (seeded + real shop accounts). No auth required. */
export async function fetchShops(): Promise<Shop[]> {
  const { data, error } = await supabase.from("shops").select("*").order("name");
  if (error) throw new Error(error.message);
  return (data as ShopRow[]).map(rowToShop);
}

/** The signed-in shop account's own store row, if they've set one up yet. */
export async function fetchMyShop(userId: string): Promise<Shop | null> {
  const { data, error } = await supabase
    .from("shops")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? rowToShop(data as ShopRow) : null;
}

/** Create or update the signed-in shop account's own store row. */
export async function upsertMyShop(
  userId: string,
  shop: { name: string; address: string | null; latitude: number | null; longitude: number | null }
): Promise<Shop> {
  const { data, error } = await supabase
    .from("shops")
    .upsert(
      {
        user_id: userId,
        name: shop.name,
        address: shop.address,
        latitude: shop.latitude,
        longitude: shop.longitude,
      },
      { onConflict: "user_id" }
    )
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return rowToShop(data as ShopRow);
}
