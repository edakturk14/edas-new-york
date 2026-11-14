# Architecture and implementation strategy

## Recommended foundation

Use React + TypeScript + Vite for a static client application, MapLibre GL JS for geographic interaction, and a locally owned customized map style. Use browser-local persistence for bookmarks and static checked-in content. Vitest (or an equivalent focused unit runner) and Playwright are suitable for the required logic and browser checks.

This is a suggested implementation architecture, not an existing app. There is no server, auth service, AI API, or database to preserve. Verify current stable dependency versions, MapLibre worker setup, Node compatibility and package licenses before installation, then commit a lockfile. Avoid adding dependencies for trivial UI behavior.

Official documentation inspected for the handoff is linked in `SOURCES.md`. Recheck API compatibility against the version actually installed. In particular, MapLibre's worker/bundler integration should follow the current installation guide rather than copied old CDN snippets.

## The map must be geographic

A generated city image is a visual reference. Do not use it as the app's single background with pins positioned by CSS percentages. Such a solution cannot keep pins tied to places while panning/zooming, cannot show branch locations correctly, and will not deliver the desired interactive guide.

Use verified longitude/latitude coordinates and a real map projection. The base map, overlays, selected state and saved state share that geographic system. Store coordinates in `[longitude, latitude]` order. Neighborhood/park shapes and route geometries need independent provenance. Never treat the visual mockup's geography as data.

## Map source and styling

Recommended first provider: OpenFreeMap's public vector tiles with a checked-in custom style derived from an appropriate documented style. At research time, its public service requires no key; still recheck its current terms/availability. Retain required map/data attribution. The provider is an external dependency and does not guarantee an SLA, so the list fallback is essential.

MapLibre supports fill-extrusion building layers and custom 3D layers. OpenFreeMap uses OpenMapTiles-compatible data. Inspect the chosen style/source schema at runtime or build time before relying on layer IDs or building-height properties; official examples use fields such as `render_height` and `render_min_height`. Do not assume every tile has every field at every zoom.

Apply the custom palette to water, land, parks, roads, building faces/tops, outlines, and label halos. Remove or strongly reduce generic business POI labels and irrelevant infrastructure text. Keep neighborhood/landmark labels helpful. Use subtle building height/color variation with actual sourced heights where available; any decorative height fallback is presentation only and must not be described as precise real-world geometry.

The selected map style should be versioned locally so an upstream style change does not unexpectedly replace the art direction. Keep source URLs configurable. Do not download an entire planet dataset, add huge unbounded assets to git, or assume an offline bulk-tile cache is allowed.

## Early map spike: solve the real visual risk first

Before building many cards, produce a small running scene with:

1. Wide bounds including lower/central Manhattan, Greenpoint, Williamsburg, LIC, DUMBO/Brooklyn Heights, and Prospect Park.
2. The approved palette applied to actual geographic layers.
3. Raised buildings at neighborhood zoom and a tested wide-zoom visual strategy.
4. Four geographic test markers representing distant areas, with coordinates clearly marked as test fixtures if not verified venue data.
5. Header/drawer padding and a mobile camera check.

The reference contains architectural detail across a wider view than many public vector building layers provide. Official MapLibre examples enable building extrusions at approximately zoom 13–15, depending on the example/source. Merely lowering a layer's `minzoom` does not create missing source geometry. Confirm coverage at the intended camera zoom before calling the design solved.

Preferred practical strategy:

- Geographic city overview with the full palette, neighborhood structure, water, bridges, and a small set of geographically anchored landmark silhouettes or simplified building masses where legitimate data is available.
- More detailed sourced 3D building extrusions as the user focuses a neighborhood.
- If using supplemental simplified building geometry for the overview, limit it to the visible NYC coverage, document origin/license, simplify for performance, and preserve real geographic anchoring.
- Keep user-facing pins above visual layers; a tall building must not make a saved recommendation impossible to select.

Do not settle for an untouched default map. Do not fake a fully detailed 3D city with arbitrary generated coordinates. Record the selected level-of-detail approach, actual tested zooms/devices, and any remaining mismatch in `IMPLEMENTATION_NOTES.md`, with screenshots. If wide-view detail is constrained, report that specifically while still completing the functional guide.

## Camera

### Added source-built scene reference

Eda supplied `gokayfem/waldo-stripes-soft` as a desired animation/world-building reference. Read `references/waldo/REUSE_GUIDE.md` before implementing custom scenery. Selective Three.js procedural props, palette helpers and performance patterns can complement the geographic map. Keep one camera/context owner, and do not install a competing standalone game renderer over MapLibre. A different implementation is acceptable only if it still provides stable real-coordinate geography, responsive accessible POI interaction and the same product requirements. The reference's no-zoom default is explicitly inappropriate here.

### Geographic camera behavior

Fit geographic bounds rather than copying one hardcoded screenshot center. An initial development envelope can be roughly west `-74.04`, east `-73.91`, south `40.65`, north `40.80`; it is only a starting camera envelope, not venue data. Adjust for the actual rendered landmarks, city orientation and viewport. Test that upper museum locations, Prospect Park and LIC remain reachable and meaningfully represented.

Start with a moderate tilt (roughly 40–55 degrees) and a bearing that keeps Manhattan and Brooklyn legible. Use less tilt on constrained mobile screens if necessary. Default zoom is derived from bounds and usable viewport; do not force a neighborhood zoom that crops most of Brooklyn. Preserve an obvious reset-to-city control.

Maintain separate padding for top controls, side drawer and bottom sheet. Fit/focus operations must consider current layout. Clamp a single-location fit to a sensible maximum zoom. Only run camera movement for deliberate selection/navigation, not every save or resize.

## Suggested source organization

```text
src/
  app/                 App shell, routing/query-state adapter, error boundaries
  components/          Header, category chips, search, neighborhood menu, drawers/sheets
  features/explore/    Filtered lists, place cards/detail, list-map switch
  features/saved/      Bookmark controls, collection view, copy-list behavior
  features/guide/      Before-you-go and neighborhood guides
  map/                 Map instance, custom style, geographic layers, marker adapter, camera
  data/                Validated guide entries, locations, sources, taxonomy, neighborhoods
  state/               One source of truth for bookmarks/selection/filter state
  lib/                 Search normalization, storage migration, links, data validation
  styles/              Tokens and small cohesive component styles
public/
  art/                 Owned category illustrations/icons only
  fonts/               Bundled font files and license notices
tests/                 Logic tests and browser acceptance scenarios
docs/                  Keep this handoff, add implementation notes and QA evidence
```

This is guidance, not a requirement to create empty directories or one-line wrappers. Keep related behavior together and avoid a giant stateful map/page file.

## Data pipeline

`docs/content/guide-seed.json` is editorial seed data, not ready-to-plot geodata. Transform it into typed runtime records as described in `CONTENT_AND_DATA.md`. Verify official addresses, branch scope, and geocoded coordinates before rendering precise venue pins. Commit source URLs and checked dates with factual enrichments. Runtime visitors should not trigger a geocoding call for every page load.

Separate `GuideEntry` (Eda's recommendation) from `PlaceLocation` (a verified branch/entrance). This avoids duplicating a review when a brand has multiple locations and supports saving one recommendation with a preferred branch.

No live API is needed for core lists/bookmarks. If a geocoder is used during preparation, follow its terms/rate limits and store verified results with provenance. Never scrape map imagery from Google/Apple to populate the city.

## Map/state integration

Create one MapLibre instance per mounted map. Clean it up on unmount. Keep event listeners stable and remove them correctly. Wait for style readiness before adding sources/layers. Update filtered GeoJSON and visual feature states, not the whole map instance.

For this small curated corpus, either accessible DOM markers or a symbol-layer/cluster implementation can work. Choose based on actual mobile performance and accessibility. A native symbol layer requires a corresponding accessible list and clear hit-testing; DOM markers require care with count/layout and pointer targets. Use stable IDs across both.

The visible set is derived from category, neighborhood, query and mode. Saved is a separate set of canonical IDs. Selection can reference an entry and an optional branch. A single selector should determine which map records and list cards match, avoiding contradictory filtering logic.

Do not store business data in DOM attributes as a second source of truth. Do not duplicate the bookmark store between a card, map layer, and drawer.

## Persistence contract

Suggested localStorage key: `edas-new-york:saved:v1`.

```json
{
  "version": 1,
  "items": [
    {
      "entryId": "radio-bakery",
      "preferredLocationId": "radio-bakery-greenpoint",
      "savedAt": "2026-11-14T16:00:00.000Z"
    }
  ]
}
```

This example is a schema illustration, not a pre-populated user collection. Start a first-time visitor with zero saved places. Validate parsed data; handle read/write exceptions, invalid IDs, duplication, migrations and storage events. Tests must cover these behaviors. Store only the small state needed, not map tiles, copied images, API secrets, or a full duplicated guide dataset.

## Resilience and accessibility

Keep map initialization inside a recoverable boundary. On unsupported WebGL or network failure, preserve the styled list, filters, details and bookmarks. A Retry map control may try again; it must not reset the collection.

All interactive chrome is real HTML with semantic controls. Provide proper dialog behavior, visible focus, readable contrast, touch targets and reduced motion. No interaction requires hover. Search/list flow is the keyboard/screen-reader equivalent of map exploration.

## Performance budgets and checks

These are targets to test, not claims already measured:

- Useful controls/content before map tiles finish.
- Avoid repeated geocoding or business-detail API requests in the visitor path.
- No long tasks on every keystroke or save for a 43-entry guide.
- Keep images resized/compressed and lazy-load nonessential media.
- Do not ship reference mockup images as multi-megabyte runtime backgrounds.
- Pause optional decorative animation offscreen; respect reduced motion.
- Inspect pan/zoom/selection on an actual mobile-sized viewport, with a realistic amount of building data.
- Run one production build and test the served output, not only the dev server.

## Hosting and handoff

A static host is sufficient. Configure asset paths and SPA fallback for the chosen deployment environment; test direct deep-link loading. Include `.env.example` only if an optional integration actually needs environment settings, with no secrets. Document install, dev, build, preview and test commands in the root README after implementation.

The initial task is to implement and deliver a reviewable preview/PR. Do not modify the user's unrelated Vercel projects or deploy over an existing personal website.
