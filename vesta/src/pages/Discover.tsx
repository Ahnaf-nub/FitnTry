import { useEffect, useState } from "react"; 
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { DiscoverCard } from "@/components/discover/DiscoverCard";
import { discoverSections } from "@/data/recommendations";
import { garments } from "@/data/garments";
import { RecommendationItem } from "@/types/tryOn";
import { useTryOnStore } from "@/hooks/useTryOnStore";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { fetchAllShopProducts, ShopProduct } from "@/services/shopProductsApi";
function shopProductToItem(p: ShopProduct): RecommendationItem {
  return {
    id: `shop_${p.id}`,
    name: p.name,
    category: p.category ?? "Full Looks",
    price: p.price ?? 0,
    image: p.imageUrl,
  };
}
export default function Discover() {
const [shopProducts, setShopProducts] = useState<ShopProduct[]>([]);

useEffect(() => {
  let cancelled = false;
  fetchAllShopProducts()
    .then((products) => { if (!cancelled) setShopProducts(products); })
    .catch(() => {});
  return () => { cancelled = true; };
}, []);
  const navigate = useNavigate();
  const { setGarment } = useTryOnStore();
  const { push } = useToast();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<RecommendationItem | null>(null);

  function toggleFavorite(item: RecommendationItem) {
    setFavorites((f) => {
      const next = new Set(f);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.add(item.id);
        push({ kind: "success", title: "Saved to favorites", description: item.name });
      }
      return next;
    });
  }

function tryOn(item: RecommendationItem) {
  const shopProduct = shopProducts.find((p) => `shop_${p.id}` === item.id);
  if (shopProduct) {
    setGarment({
      id: item.id,
      name: shopProduct.name,
      category: item.category,
      price: item.price,
      image: shopProduct.imageUrl,
      tag: "New",
    });
    navigate("/try-on");
    return;
  }
  const full = garments.find((g) => g.id === item.id);
  if (full) setGarment(full);
  navigate("/try-on");
}
  const shopSection =
  shopProducts.length > 0
    ? { id: "shops", title: "From Local Shops", subtitle: "Newly added by shops on FitnTry", items: shopProducts.map(shopProductToItem) }
    : null;

  return (
    <div className="py-10 sm:py-14">
      <div className="container-FitnTry mb-12">
        <p className="eyebrow mb-2">Discover</p>
        <h1 className="font-display text-3xl sm:text-4xl">Find what to try on next.</h1>
        <p className="mt-3 max-w-md text-[15px] text-ink-soft">
          Curated edits from the FitnTry studio — every piece is ready for virtual try-on.
        </p>
      </div>

      <div className="flex flex-col gap-14">
        {[...(shopSection ? [shopSection] : []), ...discoverSections].map((section) => (
          <section key={section.id} className="container-FitnTry">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <h2 className="font-display text-2xl">{section.title}</h2>
                <p className="mt-1 text-[13px] text-ink-faint">{section.subtitle}</p>
              </div>
            </div>

            <div className="no-scrollbar -mx-5 flex gap-4 overflow-x-auto px-5 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-6 sm:px-0">
              {section.items.map((item) => (
                <DiscoverCard
                  key={`${section.id}-${item.id}`}
                  item={item}
                  favorited={favorites.has(item.id)}
                  onView={() => setPreview(item)}
                  onTryOn={() => tryOn(item)}
                  onSave={() => toggleFavorite(item)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreview(null)}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-md bg-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreview(null)}
              aria-label="Close preview"
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-canvas/90 text-ink"
            >
              <X className="h-4 w-4" />
            </button>
            <img src={preview.image} alt={preview.name} className="aspect-[3/4] w-full object-cover" />
            <div className="p-5">
              <h3 className="font-display text-xl">{preview.name}</h3>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[13px] text-ink-faint">{preview.category}</span>
                <span className="font-mono text-[14px] text-ink">{formatPrice(preview.price)}</span>
              </div>
              <Button className="mt-5 w-full" onClick={() => { setPreview(null); tryOn(preview); }}>
                Try On
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
