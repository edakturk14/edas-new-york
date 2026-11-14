# Interaction specification

## State model

Maintain one shared application state for data selection and bookmark IDs; the map camera is a separate concern. Suggested domains:

- `mode`: explore or saved.
- `exploreFilters`: selected category, neighborhood, query; preserve these when entering Saved.
- `savedFilters`: its own query/category/neighborhood, defaulting to all on first open.
- `surface`: map or list on narrow screens.
- `selectedEntryId`, optional `selectedLocationId`.
- `drawer`: none, results, place, saved, or visitor-notes. Only one principal drawer is open.
- `savedEntries`: unique entry IDs with saved timestamps and optional preferred branch.
- `camera`: center/zoom/pitch/bearing and current padding; retain Explore camera when switching modes.

Do not remount the map for every filter, selection, or save. Data and camera updates should not produce flashes or erase the visitor's context.

## Initial load

1. Render the title, category controls, search, and available list content immediately.
2. Hydrate valid saved state before showing a misleading saved count. Use a short neutral loading treatment if necessary.
3. Load map style and tiles independently. Show a quiet loading state, not a full-screen spinner locking all content.
4. Apply a valid deep-linked place or filters; otherwise use All spots and all neighborhoods.
5. On map readiness fit the intended NYC coverage once. Do not repeat the initial fly/fit on unrelated renders.

## Filtering

For v1, category chips are single-select; All spots clears the category. A place may belong to multiple categories. Neighborhood and query intersect with the active category. Neighborhood guide entries may be included in All or a dedicated neighborhood section, not misrepresented as food venues.

Examples:

- Cafés & bakeries + Greenpoint → appropriate supplied entries with that category and neighborhood.
- Food + Greenpoint → Radio Bakery/bagel entries where relevant, Taqueria Ramirez, and other matching supplied entries.
- Museums + Williamsburg → honest empty result, not recommendations from all of Manhattan disguised as local.
- Clear filters → All spots, all neighborhoods, empty query.

Changing a category updates markers and list in the same interaction. Keep search and neighborhood unless the user explicitly clears them. Do not permanently mutate the data to filter it.

Selecting a neighborhood moves/fits the geographic camera to its verified bounds. A category change should not repeatedly fly across the city. Panning the map alone should not silently filter away the entire list. An optional visible **Search this area** control can apply viewport filtering, but do not make viewport filtering implicit.

Display a result count using logical guide entries. A chain with several branches counts as one guide entry in list results; location counts can be shown separately. Pins/clusters reflect visible location records, which may be more numerous. Make this difference clear in wording rather than silently showing contradictory counts.

## Search

Search names, aliases, supplied tags, neighborhood labels, and existing notes. Normalize case, whitespace, accents and apostrophes so `lindustrie`, `L'industrie`, and `L’industrie` can resolve the same entry. A simple local search is sufficient for this corpus.

Debounce only if useful (roughly 100–150ms). Give feedback for zero results and a clear-filter action. Escape closes the active suggestion list without deleting the query. Enter on a chosen result opens it. Avoid inaccessible fake combobox behavior; use appropriate semantic controls.

Search should work with the map disabled. Search results are recommendations from the supplied dataset; do not make live web search an implicit feature.

## Map selection

- Clicking/tapping a pin opens the matching detail card and highlights its list result.
- Clicking a cluster expands/fits it or presents the cluster's places when further zoom is unhelpful.
- Clicking a list result selects the same entry, focuses its preferred/only resolved location, and opens details.
- Clicking empty map space may close the detail card but must not clear bookmarks or filters.
- A save-button click does not also trigger the card's open/close handler. Stop event propagation appropriately.
- Keep selected markers readable above building layers. Screen projection is geographic and updates continuously while panning/zooming.
- A multi-location guide entry uses a branch chooser or branch list. Never choose a random nearest branch without explaining that choice.
- If a branch is specified in the source (Radio Bakery in Greenpoint), honor it rather than choosing another location with the same brand.

Use a **Show on map** action for areas/parks when no entrance has been selected. Use **Choose location** for unresolved multi-location brands. Never create a precise destination at a neighborhood centroid and label it the business entrance.

## Saving

Button labels: **Save** → **Saved**. The count updates immediately. All instances of an entry update together. Use the canonical entry ID as identity, not display name or array position.

For a chain, saving the guide entry adds one collection item. Choosing a branch updates `preferredLocationId`; it does not create duplicate entries unless a future explicit multi-branch collection feature is introduced.

Persist after each mutation with validation and error handling. If storage fails, keep the in-session state usable and say **Saved for this visit. Your browser couldn't store it for later.** Do not falsely promise reload persistence. On a fresh unavailable-storage session, explain the limitation concisely once.

Handle corrupted or old storage without crashing. Migrate supported schemas; recover valid IDs where possible; discard invalid shapes safely. Unknown/deleted entry IDs must not break counts or detail views. If an entry disappears from the current guide, use a truthful unavailable-item state or remove it with a clear migration rule.

Cross-tab storage events should synchronize the current collection without duplicating IDs. Use a simple consistent conflict policy, such as last successful storage write, and document it.

## Saved view

Clicking Saved opens the collection with all saved entries visible by default. Its own filters do not inherit a restrictive Explore query accidentally. Keep total count visible even when a saved filter produces zero results.

Saved map mode shows only saved resolved locations. Unresolved or area-only saved entries remain in the list with the appropriate action. **Show all on map** fits all geographically resolved saved items and reports if other saved entries need a location. With no geographic saved items, remain in list mode and explain why.

Removal leaves the drawer open, updates counts/pins, and announces the change politely. Offer **Undo** for approximately 5 seconds; undo restores the same entry and branch. Removing the final item opens the designed empty state.

**Copy list** includes entry name, neighborhood, the user's original note if present, optional selected-branch address, and a verified/source or place link. Do not include a fake address for unresolved entries. Only say **Copied** after clipboard success. If blocked, show selectable text with a clear explanation.

Do not expose bulk Clear all as a tiny accidental tap target. If implemented, it needs a confirm step within the app and is not required for v1.

## Directions and external links

For a verified selected location, open a Google Maps URL with its address/coordinates and encoded text. Use the official Maps URLs documentation. The visitor may then choose walking/transit. Do not assume geolocation permission or fill in the user's current location without a request.

Links open safely and have meaningful accessible labels. All provider keys, if any optional future integration uses them, belong in the correct environment boundary. The core guide must not require secret API keys.

For a place with no verified coordinates but a known official address, a clearly labeled external **Search in Maps** link is acceptable while precise on-map placement remains unresolved. Do not pass that state off as verified routing.

## URLs and back behavior

Support stable place deep links, for example `?place=radio-bakery`, with optional `location`, `category`, and `neighborhood` parameters. Validate IDs against known records. Unknown parameters cannot crash the app.

Opening a deep-linked place should visibly reveal the place even if conflicting filters were present; reset the relevant filters or show an explicit out-of-filter selection. Do not show a blank detail drawer. Copying a place link must not share the user's entire private saved collection.

Browser back should close/reverse an explicitly navigated place/state sensibly. Avoid adding dozens of history entries for drag, zoom, typing, or hover. Preserve map position when simply opening and closing a drawer.

## Mobile and keyboard

Minimum touch target: 44 × 44 CSS pixels for save, close, tabs, and main filters. Ensure neighboring pin hit areas do not swallow the wrong marker. Keep the bottom sheet's actions above `env(safe-area-inset-bottom)`.

Dialogs/sheets have a clear accessible name, reasonable focus management, Escape/close handling, and focus return. If modal, background controls cannot accidentally remain keyboard-focusable. Provide an accessible list alternative to every marker-based action. Visible focus ring must contrast with cream and map backgrounds.

Motion does not convey exclusive meaning. Reduced-motion mode removes bouncing/scale effects and large animated camera moves. Color is never the only distinction between selected and saved.

## Error and empty states

| Situation | Expected behavior |
| --- | --- |
| No category/neighborhood matches | Show zero count, concise message, Clear filters; do not invent alternatives |
| LIC has no supplied recommendations | Keep LIC on the map; say Eda hasn't added places here yet |
| Map tiles/WebGL unavailable | Keep the same browse/list/save experience; give Retry map |
| No bookmarks | Show the designed empty state and Explore places action |
| Storage write denied | Keep in-memory state, explain session-only save |
| Invalid deep link | Recover to Explore with a short unavailable-place message |
| Missing image | Use a polished category illustration, not broken-image chrome |
| Missing address/branch | Keep personal content, require branch choice or use honest map search |
| Clipboard blocked | Present selectable text; do not falsely say copied |
