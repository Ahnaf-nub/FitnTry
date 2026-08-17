import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Downloads an image (data URL or same/cross-origin URL) as a file.
 * For cross-origin URLs, fetches first so the browser saves a real file
 * instead of navigating to the image in a new tab (the plain <a download>
 * attribute is silently ignored by browsers for cross-origin links).
 */
export async function downloadImage(src: string, filename: string) {
  try {
    const res = await fetch(src);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch {
    // Fallback: open in a new tab so the user can save it manually if the
    // fetch was blocked (e.g. an image host without permissive CORS).
    window.open(src, "_blank", "noopener");
  }
}
