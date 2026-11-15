> Latest desktop direction: [Greenpoint miniature review](GREENPOINT_DESKTOP_REVIEW.md). This supersedes the original wide opening camera and decorative building sprites.

# Implementation brief

Owner: Eda Akturk. Repository: `edakturk14/edas-new-york`.
Prepared: 2026-11-14. Site title: **Eda's Travel Guide**.

## The product in one paragraph

Eda repeatedly sends friends a list of New York recommendations. Turn that list into a personal guide they can explore and use while visiting. The city feels like a cheerful miniature game world, with recognizable geography, colored category pins, cream pixel-edged controls, and Eda's own concise notes. A visitor can quickly find cafés/bakeries or food, narrow to a neighborhood, open a place, bookmark it, and return to a useful saved list. The primary surface is a map; an accessible list makes the same information easy to browse.

## User decisions already made

1. The selected direction is the bright **city quest** concept, not the evening palette.
2. Use a detailed elevated 3D/miniature-city perspective inspired by the user's aerial reference.
3. Pull the camera back. Brooklyn, Greenpoint, Williamsburg, and Long Island City need meaningful space alongside Manhattan.
4. The title sits in the top center. Category filters sit directly below it.
5. The app should feel whimsical and game-like, while remaining easy to use.
6. Café/bakery and food discovery, bookmarking, and the Saved view are essential.
7. The complete source recommendation list is provided. There is no need to generate generic NYC recommendations.
8. Jev and other AI models are optional future experiments, not part of this build.

## Read and inspect in this order

1. `../AGENTS.md`
2. `design/README.md` and the images it lists
3. `PRODUCT.md`
4. `DESIGN.md` and `design/tokens.json`
5. `INTERACTIONS.md`
6. `CONTENT_AND_DATA.md`, `content/guide-seed.json`, `content/eda-original-notes.md`, `content/visitor-notes.md`
7. `ARCHITECTURE.md` and `SOURCES.md`
8. `ACCEPTANCE.md`
9. `FACTORY_WORKSTREAM.md`

Also read `references/waldo/REUSE_GUIDE.md`. Eda supplied this code-built 3D scene as an animation reference after the initial mockup. It is a reference for procedural geometry and motion, not a replacement for NYC geography or the approved palette.

## Five release-critical scenarios

### A. Find a bakery in Greenpoint

Open the site. Select **Cafés & bakeries**, choose **Greenpoint**, and find **Radio Bakery** in both map and list. Open it, read "Amazing, in Greenpoint.", and save it with one obvious button. The café filter is visible without opening an obscure menu.

### B. Find food beyond Manhattan

Select **Food**, then **Greenpoint**. **Taqueria Ramirez** is discoverable and retains the user's "spicy!!" note. At city overview, clusters help keep dense areas readable. Focusing Greenpoint actually moves the geographic camera to Greenpoint.

### C. Revisit saved places

Save Radio Bakery, The Met, Westlight, and Prospect Park. The Saved count becomes four. Reload. Open **Saved places** and see those same four records, each with its name, neighborhood, category, note where supplied, bookmark toggle, and the appropriate map/directions action. There is no forced signup.

### D. Be honest about recommendations

Open Lucali, Katz's Delicatessen, Guggenheim, or Bernie's. A clear **Eda hasn't been yet** badge remains visible. Do not rewrite the card as a personal visit or generate an enthusiastic first-person review.

### E. Use the guide on a phone

At 390px wide, the title, café filter, search, selected-place sheet, bookmark action, directions action, and Saved tab are usable with a thumb. The sheet does not hide the selected pin. Keyboard opening, safe areas, scrolling, and close/back behavior work.

## Scope boundaries

Required: map/list exploration, categories, neighborhoods, search, place detail, browser-local saved places, saved list and saved-map mode, visitor notes, responsive design, accessible controls, shareable place links, directions links for resolved locations, data provenance, meaningful tests.

Later: multi-stop itinerary planning, route optimization, user accounts, shared cloud collections, reservations, live opening hours, weather, "open now", social reviews, AI-generated itineraries, voice, and gamification beyond visual style. Do not make any later feature necessary for the core flow.

## Done means

The implementation looks intentionally close to the reference direction, uses real geographic map coordinates, implements all five scenarios, preserves the full source content, and passes the documented checks. Provide a working preview, desktop/mobile screenshots, a completed acceptance report, and one coherent PR or the configured equivalent. Include honest notes about any map coverage or unresolved external facts.

The supplied mockup is a visual target, not a promise that its generated building shapes and landmark positions are cartographically exact. Use geographic data for the actual app. The exact implementation strategy for wide-zoom building detail must be tested early, as described in `ARCHITECTURE.md`.
