import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { fetchMyShop, upsertMyShop, Shop } from "@/services/shopsApi";
import {
  fetchProductsForShop,
  addShopProduct,
  deleteShopProduct,
  ShopProduct,
} from "@/services/shopProductsApi";
import { GarmentCategory } from "@/types/tryOn";
import { formatPrice } from "@/lib/utils";
import { MapPin, Loader2, Trash2, Plus } from "lucide-react";

const CATEGORIES: GarmentCategory[] = ["Tops", "Bottoms", "Dresses", "Jackets", "Full Looks", "Bags"];

export default function MyStore() {
  const { user } = useAuth();
  const { push } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [myShop, setMyShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchMyShop(user.id)
      .then((shop) => {
        if (shop) {
          setMyShop(shop);
          setName(shop.name);
          setAddress(shop.address ?? "");
          setLatitude(shop.latitude != null ? String(shop.latitude) : "");
          setLongitude(shop.longitude != null ? String(shop.longitude) : "");
          loadProducts(shop.id);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load your store."))
      .finally(() => setLoading(false));
  }, [user]);

  function loadProducts(shopId: string) {
    setProductsLoading(true);
    fetchProductsForShop(shopId)
      .then(setProducts)
      .catch((err) =>
        push({ kind: "error", title: "Couldn't load your products", description: err instanceof Error ? err.message : undefined })
      )
      .finally(() => setProductsLoading(false));
  }

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setError("Your browser doesn't support location. Enter coordinates manually instead.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setLocating(false);
      },
      () => {
        setLocating(false);
        setError("Couldn't get your location — enter coordinates manually instead.");
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSaving(true);
    try {
      const shop = await upsertMyShop(user.id, {
        name: name.trim(),
        address: address.trim() || null,
        latitude: latitude.trim() ? Number(latitude) : null,
        longitude: longitude.trim() ? Number(longitude) : null,
      });
      setMyShop(shop);
      push({ kind: "success", title: "Store details saved" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your store.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="container-FitnTry py-16 text-center text-[13px] text-ink-faint">Loading…</div>;
  }

  return (
    <div className="container-FitnTry py-16">
      <div className="mx-auto grid max-w-4xl gap-10 lg:grid-cols-[minmax(0,320px)_1fr]">
        <div>
          <p className="eyebrow mb-2">Store owner</p>
          <h1 className="mb-2 font-display text-3xl">My Store</h1>
          <p className="mb-6 text-[13px] text-ink-faint">
            These details show up in shoppers' "Clothing stores near you" list.
          </p>

          {error && (
            <div className="mb-6">
              <Alert title={error} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-[12.5px] font-medium text-ink-soft">
                Store name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-sm border border-line-strong bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-ink"
              />
            </div>
            <div>
              <label htmlFor="address" className="mb-1.5 block text-[12.5px] font-medium text-ink-soft">
                Address
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-sm border border-line-strong bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-ink"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[12.5px] font-medium text-ink-soft">Location</span>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locating}
                  className="flex items-center gap-1 text-[12px] font-medium text-ink underline underline-offset-4 disabled:opacity-50"
                >
                  {locating ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3" />}
                  Use my current location
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Latitude"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full rounded-sm border border-line-strong bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-ink"
                />
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Longitude"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full rounded-sm border border-line-strong bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-ink"
                />
              </div>
              <p className="mt-1.5 text-[11.5px] text-ink-faint">
                Coordinates are optional but let shoppers sort by distance. You can also just fill in
                the address and skip these.
              </p>
            </div>

            <Button type="submit" className="w-full" loading={saving} disabled={saving}>
              {myShop ? "Save changes" : "Create my store"}
            </Button>
          </form>
        </div>

        <div>
          {myShop ? (
            <ProductsPanel
              shopId={myShop.id}
              products={products}
              loading={productsLoading}
              onAdded={(p) => setProducts((prev) => [p, ...prev])}
              onRemoved={(id) => setProducts((prev) => prev.filter((p) => p.id !== id))}
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-md border border-dashed border-line-strong p-10 text-center text-[13px] text-ink-faint">
              Save your store details first — then you can start adding what you carry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductsPanel({
  shopId,
  products,
  loading,
  onAdded,
  onRemoved,
}: {
  shopId: string;
  products: ShopProduct[];
  loading: boolean;
  onAdded: (p: ShopProduct) => void;
  onRemoved: (id: string) => void;
}) {
  const { push } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<GarmentCategory>("Tops");
  const [price, setPrice] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function resetForm() {
    setName("");
    setCategory("Tops");
    setPrice("");
    setImageDataUrl(null);
    setShowForm(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!imageDataUrl) {
      push({ kind: "error", title: "Add a photo of the item first" });
      return;
    }
    setAdding(true);
    try {
      const product = await addShopProduct(shopId, {
        name: name.trim(),
        category,
        price: price.trim() ? Number(price) : null,
        imageUrl: imageDataUrl,
      });
      onAdded(product);
      push({ kind: "success", title: "Added to your store" });
      resetForm();
    } catch (err) {
      push({ kind: "error", title: "Couldn't add this item", description: err instanceof Error ? err.message : undefined });
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(id: string) {
    setRemovingId(id);
    try {
      await deleteShopProduct(id);
      onRemoved(id);
    } catch (err) {
      push({ kind: "error", title: "Couldn't remove this item", description: err instanceof Error ? err.message : undefined });
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl">What you carry</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1 rounded-full border border-line-strong px-3.5 py-1.5 text-[12.5px] font-medium text-ink hover:border-ink"
        >
          <Plus className="h-3.5 w-3.5" /> Add item
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-6 space-y-3 rounded-md border border-line bg-surface p-4">
          <input
            type="text"
            placeholder="Item name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-sm border border-line-strong bg-canvas px-3 py-2 text-[13.5px] text-ink outline-none focus:border-ink"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as GarmentCategory)}
              className="w-full rounded-sm border border-line-strong bg-canvas px-3 py-2 text-[13.5px] text-ink outline-none focus:border-ink"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Price (optional)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-sm border border-line-strong bg-canvas px-3 py-2 text-[13.5px] text-ink outline-none focus:border-ink"
            />
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="w-full text-[12.5px] text-ink-soft"
          />
          {imageDataUrl && (
            <img src={imageDataUrl} alt="Preview" className="h-24 w-24 rounded-sm object-cover" />
          )}
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={adding} disabled={adding}>
              Add to store
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-[13px] text-ink-faint">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-[13px] text-ink-faint">Nothing added yet — items you add show up here.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {products.map((p) => (
            <div key={p.id} className="group relative overflow-hidden rounded-sm border border-line-strong">
              <img src={p.imageUrl} alt={p.name} className="aspect-[3/4] w-full object-cover" />
              <div className="p-2">
                <p className="truncate text-[12px] font-medium text-ink">{p.name}</p>
                <p className="text-[11px] text-ink-faint">
                  {p.category}
                  {p.price != null ? ` · ${formatPrice(p.price)}` : ""}
                </p>
              </div>
              <button
                onClick={() => handleRemove(p.id)}
                disabled={removingId === p.id}
                aria-label={`Remove ${p.name}`}
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-canvas/90 text-ink opacity-0 transition-opacity group-hover:opacity-100"
              >
                {removingId === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
