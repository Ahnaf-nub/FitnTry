import { supabase } from "@/lib/supabaseClient";
import { GarmentCategory } from "@/types/tryOn";

export interface ShopProduct {
  id: string;
  shopId: string;
  name: string;
  category: GarmentCategory | null;
  price: number | null;
  imageUrl: string;
  createdAt: string;
}

interface ShopProductRow {
  id: string;
  shop_id: string;
  name: string;
  category: string | null;
  price: number | null;
  image_url: string;
  created_at: string;
}

function rowToProduct(row: ShopProductRow): ShopProduct {
  return {
    id: row.id,
    shopId: row.shop_id,
    name: row.name,
    category: (row.category as GarmentCategory) ?? null,
    price: row.price,
    imageUrl: row.image_url,
    createdAt: row.created_at,
  };
}

/** Everything a given shop carries — public, no auth required. */
export async function fetchProductsForShop(shopId: string): Promise<ShopProduct[]> {
  const { data, error } = await supabase
    .from("shop_products")
    .select("*")
    .eq("shop_id", shopId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as ShopProductRow[]).map(rowToProduct);
}
/** Every product from every shop — public, powers the Discover feed. */
export async function fetchAllShopProducts(): Promise<ShopProduct[]> {
  const { data, error } = await supabase
    .from("shop_products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as ShopProductRow[]).map(rowToProduct);
}
export async function addShopProduct(
  shopId: string,
  product: { name: string; category: GarmentCategory | null; price: number | null; imageUrl: string }
): Promise<ShopProduct> {
  const { data, error } = await supabase
    .from("shop_products")
    .insert({
      shop_id: shopId,
      name: product.name,
      category: product.category,
      price: product.price,
      image_url: product.imageUrl,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return rowToProduct(data as ShopProductRow);
}

export async function deleteShopProduct(id: string): Promise<void> {
  const { error } = await supabase.from("shop_products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
