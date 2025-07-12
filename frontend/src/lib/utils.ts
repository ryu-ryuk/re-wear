import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the full URL for an image from the backend
 * @param imageUrl - The image URL from the backend API
 * @returns The full URL to display the image
 */
export function getImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) return "https://via.placeholder.com/400x300?text=No+Image";

  // If it's already a full URL, return as is
  if (imageUrl.startsWith("http")) return imageUrl;

  // Get the API base URL and remove /api to get the media server URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
  const MEDIA_BASE_URL = API_BASE_URL.replace("/api", "");

  // If it starts with /media/, prepend the base URL
  if (imageUrl.startsWith("/media/")) {
    return `${MEDIA_BASE_URL}${imageUrl}`;
  }

  // Otherwise, assume it needs the full media path
  return `${MEDIA_BASE_URL}/media/${imageUrl}`;
}
