export type GarmentCategory =
  | "Tops"
  | "Bottoms"
  | "Dresses"
  | "Jackets"
  | "Full Looks"
  | "Bags";

export type Gender = "Women" | "Men";

export type BodyArea = "Auto Detect" | "Upper Body" | "Lower Body" | "Full Body";

export type StyleOccasion =
  | "Casual"
  | "University"
  | "Office"
  | "Party"
  | "Date"
  | "Wedding";

export interface Garment {
  id: string;
  name: string;
  category: GarmentCategory;
  gender?: Gender;
  price: number;
  image: string;
  designer?: string;
  colorway?: string;
  tag?: "New" | "Editor's Pick" | "Trending" | "Limited";
}

export interface RecommendationItem {
  id: string;
  name: string;
  category: GarmentCategory;
  price: number;
  image: string;
}

export type GenerationStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "completed"
  | "failed";

export interface TryOnJob {
  jobId: string;
  status: "processing" | "completed" | "failed";
  resultImage?: string;
  error?: string;
}

export interface TryOnRequestPayload {
  userImage: string;
  garmentImage: string;
  garmentCategory: string;
  /** Only meaningful for garmentCategory "Bags" — the Bag API needs a gender parameter. */
  gender?: Gender;
}

export interface SavedLook {
  id: string;
  resultImage: string;
  beforeImage: string;
  garment: Garment;
  style?: StyleOccasion;
  createdAt: string;
  favorite: boolean;
}

/** Discriminated app-level error so the UI never has to guess what happened. */
export type TryOnErrorCode =
  | "INVALID_IMAGE"
  | "UNSUPPORTED_FORMAT"
  | "MISSING_USER_PHOTO"
  | "MISSING_GARMENT"
  | "NETWORK_ERROR"
  | "GENERATION_FAILED"
  | "SERVER_ERROR";

export interface TryOnError {
  code: TryOnErrorCode;
  message: string;
}
