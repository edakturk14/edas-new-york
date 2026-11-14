# Content and data contract

## Source of truth

Eda's personal content is in `content/eda-original-notes.md`. `content/guide-seed.json` contains 43 matching editorial records. It deliberately leaves exact coordinates and runtime geometries empty. This is an honest seed, not pretend-verified geographic data.

Preserve every original entry, including broad activities and neighborhoods. The implementation must enrich addressable venues before plotting precise pins. The seed's `neighborhoodHints` are editorial hints or provisional geographic classifications, not verified coordinate evidence.

## Runtime entities

### GuideEntry

- `id`: stable slug from the seed; do not rename simply because display punctuation changes.
- `name`: original recommendation/brand name.
- `kind`: venue, brand, area, walk, neighborhood, activity-guide, or area-guide.
- `categoryIds`: one or more taxonomy IDs.
- `tags`, `aliases`: supplied or factually supported search metadata.
- `edaNoteOriginal`: immutable source wording or null.
- `edaNoteDisplay`: light readability edit or null. Never generate a first-person experience.
- `visitStatus`: `not-visited` only for the four explicit cases; `not-stated` otherwise until Eda confirms. Do not automatically badge all other entries as visited.
- `isExplicitFavorite`: true only where the user explicitly said favorite; The Met is the current example.
- `locationIds`: verified branches/entrances associated with the recommendation.
- `geometryId`: optional sourced region/route; not a substitute for a venue address.
- `sources`: editorial and factual provenance, with fields supported and check date.

### PlaceLocation

- `id`: stable branch-qualified slug, such as `radio-bakery-greenpoint`.
- `entryId`: parent editorial recommendation.
- `branchLabel`: visible name when there are alternatives.
- `address`, `borough`, `neighborhoodIds`.
- `coordinates`: `[longitude, latitude]` only when verified. Null is permitted during content preparation, not a made-up fallback point.
- `coordinateSource`, `addressSource`, `verifiedAt`: traceable factual references.
- `officialUrl`: official page verified to describe this venue/branch.
- `reservationUrl`: only if verified and relevant; not every restaurant accepts reservations.
- `image`: optional source/credit/license/alt metadata. A category illustration is an acceptable default.
- `status`: verified, needs-review, closed/unavailable if confirmed by a reliable source.

### Neighborhood / route

Neighborhoods need IDs, labels, borough, approximate boundary/bounds provenance and a camera target. A named neighborhood can be saved as a guide without inventing a street address. Routes need either verified pedestrian geometry or a simple ordered list of named stops; do not draw straight decorative lines across water and call them walking directions.

### SavedEntry

Use the schema in `ARCHITECTURE.md`: canonical `entryId`, optional `preferredLocationId`, `savedAt`. The UI can show an area or broad activity in Saved even when it has no point coordinate.

## Important enrichment decisions

| Source entry | Treatment |
| --- | --- |
| Radio Bakery | Eda specifically said Greenpoint. Official source inspected: 135 India Street, Brooklyn. Geocode/verify that branch; do not silently choose another Radio location. |
| Taqueria Ramirez | Preserve Greenpoint and "Spicy!!". Verify address/coordinate; do not invent a spice rating. |
| Bar Pisellino | Original bar recommendation. Official site describes espresso and lists its West Village address, supporting café/bar categorization. It also says no reservations; do not apply a universal reservation requirement. |
| Apollo Bagels, LOS TACOS No.1, Xi'an Famous Foods, Levain | Brand-level recommendations with unspecified branches. Associate researched branch records, use branch-qualified map labels, and let visitors choose a location. The note remains brand-level. |
| L'industrie, Tompkins Square Bagels, Fish Cheeks, Dante, Caffè Panna | Resolve current branch ambiguity from official sources. Preserve any supplied neighborhood hint; don't assume the first search result is the intended location. |
| Chinatown dumplings | Neighborhood food idea, not a specific business. Keep a guide card or clearly labeled area marker. Do not pick a dumpling shop and attribute it to Eda. |
| Sports | Broad activity card. Do not invent a team, date, stadium or ticket price. |
| Broadway / TodayTix | Broad activity and user-suggested booking resource. Verify its link; no fabricated show recommendations or availability. |
| Comedy Cellar | Resolve venue/branch selection before directions. |
| NYC Ferry | Activity/network guide. Ferry landings are transport data, not extra personal restaurant recommendations. |
| High Line | Park/walk with multiple access points; avoid one fake entrance. Keep Eda's nearby-area suggestions as notes. |
| Brooklyn Bridge | Retain her preferred direction: Brooklyn to Manhattan. Verify walking access when implementing a route. |
| Greenpoint waterfront | Preserve Transmitter Park → Greenpoint Ferry. Verify route/landing details before navigation. |
| LIC | Include geographically and in neighborhood selection. No specific LIC recommendations supplied; don't populate with invented personal picks. |

The eight neighborhood guide entries are editorial guides. Region taxonomy may contain additional areas needed for honest venue addresses, such as Greenpoint and LIC, without presenting those areas as new personally reviewed venues.

## Café/bakery classification

The user specifically wants cafés easy to discover. Keep a visible Cafés & bakeries filter. The initial corpus includes bakery/bagel recommendations (Radio Bakery, Levain, Apollo, Tompkins Square Bagels) and a café/bar supported by official information (Bar Pisellino). A place's inclusion as a bakery does not establish that it sells coffee. Avoid cafe-specific claims until researched.

Caffè Panna was recommended for ice cream; classify it as dessert/food unless coffee service is separately verified. Do not infer a service from the word "Caffè" alone. If Eda later supplies dedicated cafés, add them through the same data contract.

## Verification workflow for Droid

1. Keep all original IDs and notes.
2. Resolve exact establishment and branch scope from official websites or official venue profiles.
3. Confirm current address/status, without treating absence of hours as closure.
4. Geocode the confirmed address using an allowed source. Compare with the official address and neighborhood; inspect obvious mismatches.
5. Store the coordinate/address provenance and check date. Use `verifiedAt` for the fact check, not merely the date the JSON was written.
6. For multi-location brands, preserve parent/child relationships and label each chosen branch. Do not silently bulk-add every global branch.
7. Check directions links with the selected branch and properly escaped URLs.
8. Confirm all 43 source entries are represented as appropriate venue/area/activity cards.
9. Report any unresolved entries explicitly in the acceptance report. Broad guide entries are legitimate non-point records; unresolved named venue pins are remaining implementation work.

Do not scrape or republish third-party review text. Eda's note is the review content. Operational facts should have sources and should not be written in Eda's voice.

## Images and thumbnails

Generated design screenshots show illustrative pastry, museum, park and cocktail thumbnails. They are not actual photographs of the venues. For production, use original category illustrations, Eda's photos when available, or appropriately licensed/sourced images with attribution. Record source/license in an asset manifest. The app must remain visually complete using category illustrations alone.

## Validation

Validate unique IDs, allowed categories, parent/location references, branch identity, URL formats, coordinates and their provenance. Coordinate values must be finite and plausible for the intended NYC coverage; a bounding-box test alone does not prove a correct address. Verify all explicit unvisited statuses and the only explicit favorite flag. Alias normalization should handle Unicode apostrophes/accents.

Provide a practical editing guide for Eda in the completed README: add a record, add/verify a location if needed, attach image metadata, run validation, and preview the result. Keep content separate from UI source so updating one recommendation is a small diff.
