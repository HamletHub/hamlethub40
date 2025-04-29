// Map of hub IDs to town slugs
export const hubToTownSlug: Record<string, string> = {
  // Example mapping based on Ridgefield's hubId from page.tsx
  "657a0795ef68cad2ad47912c": "ridgefield-connecticut",
  // Add other towns as needed
};

// Get town slug from hub ID
export function getTownSlugFromHubId(hubId: string): string | null {
  return hubId ? (hubToTownSlug[hubId] || null) : null;
}

// Get hub ID from town slug
export function getHubIdFromTownSlug(townSlug: string): string | null {
  for (const [hubId, slug] of Object.entries(hubToTownSlug)) {
    if (slug === townSlug) {
      return hubId;
    }
  }
  return null;
} 