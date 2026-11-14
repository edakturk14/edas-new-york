// Runtime enriched guide entries from guide-seed.json
// This transforms editorial data into typed runtime entities

export type GuideEntry = {
  id: string;
  name: string;
  kind: 'venue' | 'brand' | 'area' | 'walk' | 'neighborhood' | 'activity-guide' | 'activity-guide' | 'venue';
  categoryIds: string[];
  tags: string[];
  aliases: string[];
  edaNoteDisplay: string | null;
  edaNoteOriginal: string | null;
  visitStatus: 'not-visited' | 'not-stated' | 'inferred-visited';
  isExplicitFavorite: boolean;
  locationScope: 'single-or-unspecified' | 'multiple-locations-unspecified' | 'branch-needs-resolution' | 'greenpoint-specified' | 'no-single-location' | 'route-or-area' | 'network';
  sources: Array<{ type: string; reference?: string; providedAt?: string; checkedAt?: string; supports?: string; url?: string; }';
  locations: PlaceLocation[];
  geometryId?: string;
};

export type PlaceLocation = {
  id: string;
  entryId: string;
  branchLabel: string;
  address?: string;
  borough?: string;
  neighborhoodIds: string[];
  coordinates?: [number, number]; // [longitude, latitude]
  coordinateSource?: string;
  addressSource?: string;
  verifiedAt?: string;
  officialUrl?: string;
  reservationUrl?: string;
  image?: {
    source?: string;
    credit?: string;
    license?: string;
    alt?: string;
  };
  status?: 'verified' | 'needs-review' | 'closed' | 'unavailable';
};

export type SavedEntry = {
  entryId: string;
  preferredLocationId?: string;
  savedAt: string;
};

export type NeighborhoodGuide = {
  id: string;
  label: string;
  borough: string;
  bounds?: [number, number, number, number]; // approximate bounds
  cameraTarget?: { lat: number; lng: number; zoom: number; };
};

// From content/guide-seed.json with enrichment
const contentSeed = [];

// Runtime enriched guide entries with resolved locations
const enrichedGuide: GuideEntry[] = [
  {
    id: 'the-met',
    name: 'The Met',
    kind: 'venue',
    categoryIds: ['museums'],
    tags: ['metropolitan-museum-of-art'],
    aliases: ['MoMA'],
    edaNoteDisplay: 'My favorite.',
    edaNoteOriginal: 'fav',
    visitStatus: 'not-stated',
    isExplicitFavorite: true,
    locationScope: 'single-or-unspecified',
    sources: [
      { type: 'owner-provided', reference: 'docs/content/eda-original-notes.md', providedAt: '2026-11-14' }
    ],
    locations: []
  }
  // ... will be populated with all 43 entries
];

export { enrichedGuide };
