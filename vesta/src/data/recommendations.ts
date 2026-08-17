import { RecommendationItem, SavedLook } from "@/types/tryOn";
import { garments } from "./garments";

const img = (seed: string, w = 600, h = 800) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const recommendations: RecommendationItem[] = [
  { id: "r-01", name: "Wide-Leg Trousers", category: "Bottoms", price: 148, image: "/wide-leg-trousers.jpg" },
  { id: "r-02", name: "Leather Ankle Boot", category: "Full Looks", price: 265, image: "/leather-ankle.jpg" },
  { id: "r-03", name: "Tailored Wool Blazer", category: "Jackets", price: 340, image: "/tailored-wool-blazer.jpg" },
  { id: "r-04", name: "Structured Tote", category: "Full Looks", price: 195, image: "/structured-tote.jpg" },
];

export interface DiscoverSection {
  id: string;
  title: string;
  subtitle: string;
  items: RecommendationItem[];
}

export const discoverSections: DiscoverSection[] = [
  {
    id: "trending",
    title: "Trending Now",
    subtitle: "What everyone is virtually trying on this week",
    items: garments.slice(0, 4).map((g) => ({
      id: g.id, name: g.name, category: g.category, price: g.price, image: g.image,
    })),
  },
  {
    id: "editors",
    title: "Editor's Picks",
    subtitle: "Curated by the FitnTry styling team",
    items: garments.slice(4, 8).map((g) => ({
      id: g.id, name: g.name, category: g.category, price: g.price, image: g.image,
    })),
  },
  {
    id: "streetwear",
    title: "Streetwear",
    subtitle: "Relaxed silhouettes, considered layering",
    items: garments.slice(2, 6).map((g) => ({
      id: g.id, name: g.name, category: g.category, price: g.price, image: g.image,
    })),
  },
  {
    id: "smart-casual",
    title: "Smart Casual",
    subtitle: "Polished, easy, office-to-evening",
    items: garments.slice(6, 10).map((g) => ({
      id: g.id, name: g.name, category: g.category, price: g.price, image: g.image,
    })),
  },
  {
    id: "occasion",
    title: "Occasion",
    subtitle: "Weddings, dinners, dates — dressed right",
    items: [garments[6], garments[7], garments[9], garments[10]].map((g) => ({
      id: g.id, name: g.name, category: g.category, price: g.price, image: g.image,
    })),
  },
];

/** Seed data so the Saved Looks gallery is never empty on first run. */
export const seedSavedLooks: SavedLook[] = [
  {
    id: "look-01",
    resultImage: "/silk-blouse.jpg" ,
    beforeImage: "/silk-blouse.jpg" ,
    garment: garments[0],
    style: "Office",
    createdAt: "2026-07-18",
    favorite: true,
  },
  {
    id: "look-02",
    resultImage: "/bias-cut-slip-dress.jpg" ,
    beforeImage: "/bias-cut-slip-dress.jpg" ,
    garment: garments[6],
    style: "Date",
    createdAt: "2026-07-22",
    favorite: false,
  },
  {
    id: "look-03",
    resultImage: "/trench-coat-belted.jpg" ,
    beforeImage: "/trench-coat-belted.jpg" ,
    garment: garments[9],
    style: "Casual",
    createdAt: "2026-07-29",
    favorite: false,
  },
];
