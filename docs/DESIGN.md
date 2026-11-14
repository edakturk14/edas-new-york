# Design specification

## Art direction

Build a cheerful miniature New York world with the approved city-quest palette and the user's more architectural 3D aerial reference. The city has real land/water relationships, raised buildings, recognizable neighborhoods, soft sunlight, and a sense of depth. The interface has cream panels, dark plum edges, coral accents, and restrained pixel details.

The result should feel like opening a beautifully made city-exploration game that happens to contain a friend's useful recommendations. It should still be calm enough to read on a phone in daylight. Do not make a glossy AI dashboard, a generic travel landing page, a neon arcade, or a screen full of gamification counters.

## Reference priority

1. Latest written instructions: cafés/food easy to find, saving easy, Saved view complete, wide Brooklyn and LIC coverage.
2. `approved-city-overview.webp`: main world, palette, header and category-pin direction.
3. `saved-places-desktop.webp` and `cafe-detail-mobile.webp`: proposed interaction-state references for implementation. They are supporting mockups, not separate user-approved visual directions.
4. `palette-and-game-ui-reference.webp`: original chosen option 2 for color and pixel UI character.
5. `aerial-city-spatial-reference.webp`: user's uploaded reference for camera/building detail only. It depicts another city and contains video controls. Do not copy its geography, playback UI, or gray palette.

Written requirements override inconsistencies in image text, pin locations, status counts, or icon shapes. The images are not geographic ground truth.

## Palette

Exact starting values live in `design/tokens.json`. These are implementation choices sampled conceptually from the visual direction, not a claim of exact pixel extraction.

| Role | Color | Usage |
| --- | --- | --- |
| Ink | `#34133F` | Text, pixel outlines, selected bookmark |
| Cream | `#FFF4D9` | Panels, chips, cards |
| Paper | `#FFF9EE` | Reading surfaces |
| Coral | `#FF786D` | Selection, focused place, emphasis |
| Deep coral | `#B43E40` | Darker coral text/accent where needed |
| River | `#73BFE8` | Main water |
| River shade | `#469BD0` | Depth and subtle movement |
| Park | `#99BE74` | Green spaces |
| Park shade | `#648C50` | Tree mass / boundaries |
| Butter | `#EFCB85` | Building tops / architectural accents |
| Rose | `#DDA7A1` | Warm building accents |
| Lavender | `#B8A4DB` | Secondary category details / shadows |

Check rendered contrast for each use. Coral and pastel backgrounds use dark ink text, not automatic white text. Distinguish selected/saved states by label, icon, and outline as well as color.

## Typography

Title and short game labels: a readable pixel-inspired display face such as **Pixelify Sans**, with a measured fallback to the same role. Body and controls: **DM Sans** or a similarly clean readable sans. Bundle the chosen fonts and their licenses; use only needed weights. Verify exact packages/font availability at implementation time.

- Desktop title: roughly 30–38px, medium/bold, one line.
- Mobile title: 20–25px, one or two compact lines if needed.
- Main filter labels: 14–16px, semibold. Avoid all-uppercase tiny pixel type.
- Place title: 21–25px desktop, 20–24px mobile.
- Body notes: 15–17px with 1.45–1.6 line-height.
- Metadata: 12–14px, still high enough contrast.

Do not render paragraphs in a hard-to-read bitmap font. Do not bake any interactive text into an image.

## Map composition

The default camera must make the guide's coverage obvious. In a wide screen, Manhattan occupies roughly the left third to half, with Brooklyn and LIC visibly represented across the right and lower portions. Do not simply zoom in on Midtown. Greenpoint, Williamsburg, DUMBO/Brooklyn Heights, and Prospect Park should be within the intended overview region. Long Island City must be labeled as Queens, not Brooklyn.

The full viewport is the map world. Floating chrome has compact footprints. Target 70–80% unobstructed map area in the initial desktop state; an open saved/results drawer may take more. Avoid artificial sky taking up useful map space. Real 3D buildings and properly styled streets should support exploration rather than overpower POI markers.

Use explicit camera padding around header, drawers, controls, and mobile sheet. A selected pin must remain in the visible map area. `fitBounds` or an equivalent needs the correct current padding and maximum zoom, especially for a single saved place.

Geographic building data has zoom-dependent availability. At wide zoom, provide a tasteful geographic overview with a tested landmark/detail strategy; at neighborhood zoom, show denser 3D buildings. See `ARCHITECTURE.md`. Do not claim identical detail at every zoom without verifying source data and device performance.

## HUD / controls

- Title plaque: warm cream, 2px plum outline, subtle stepped corners or small corner notches, restrained 3–4px offset shadow. It is not a huge separate navigation bar.
- Filter chips: 40–44px minimum high, short readable label and one category icon. Active state uses coral fill and inset/offset depth change.
- Saved button: top-right desktop, persistent bottom tab mobile; filled/outline bookmark and visible count.
- Before you go: small guide-book control with readable label on desktop and accessible labeled icon on mobile.
- Search: quiet cream field, visible magnifier, clear button once text exists. Search should not look like an AI prompt box.
- Neighborhood selector: searchable or modest native-accessible menu. Include clear **All neighborhoods** reset.
- Map controls: zoom, reset view, and optional tilt/reset bearing. Do not expose developer camera numbers in the product.

Use one internally consistent pixel/stepped icon family. Café markers use a cup, bakery markers a croissant/bread, food markers cutlery or a slice, bars a glass, museums a column building, walks a tree/footsteps, activities a ticket. Use owned SVG/CSS assets for crisp controls. Do not mix emoji rendering across operating systems.

## Pins and clusters

- Pin visual target: 28–34px at desktop, with 44px-or-larger hit area on touch devices.
- Place pins are sparse enough to scan. Cluster crowded points, displaying a legible count.
- Selected pin: coral ring/halo plus slightly stronger outline; category symbol stays recognizable.
- Saved pin: small filled bookmark badge. Do not replace its category icon with an unrelated heart.
- Selected and saved can be simultaneous states.
- Hide generic third-party commercial POIs so Eda's recommendations are the main selectable places.
- Category filters change both map and list. Distinct categories remain understandable without relying on hue alone.

Do not animate every marker continuously. A crowded pulsing city looks noisy and uses power unnecessarily.

## Cards and drawers

Desktop selected-place or saved drawer: normally 340–380px wide; close control is fixed within its own header. Use one principal drawer at a time. The map remains mounted and visible. A place card has a modest illustration/photo, name, metadata, Eda's note, honest visit status, Save and Directions. Essential actions stay visible without scrolling a long card.

Saved drawer: clear **Saved places** heading, count, **Show all on map**, a scrollable list, and unobtrusive device-local storage explanation. Each row has a large bookmark toggle and its main actions; removing one item should not close the whole drawer.

Empty Saved: a small original bookmark/map illustration, **Your New York list starts here**, concise instruction to save places, and **Explore places**. No signup CTA.

Mobile detail sheet: three sensible positions if implementing drag (peek / readable detail / expanded); otherwise an accessible fixed-height sheet is acceptable if all content is reachable. Include a handle and close button, scroll only the sheet content, keep bottom navigation and actions out of the OS safe area. Drag gestures must not accidentally pan the map underneath. Do not force every list row into an oversized image card.

## Screen layouts

### Desktop overview (1440 × 900 and 1280 × 800)

Title centered above filter row. Small top-corner actions. Search/neighborhood beneath without creating a 250px header. Map is the immediate hero. A short initial hint can say **Pick a pin or choose a category** and disappears after interaction. The latest mockup's `My day` control becomes the single **Saved** workflow for v1; do not build redundant bookmark stores.

### Desktop cafés/results

Select Cafés & bakeries; show a result count and compact cards in the left drawer. Radio Bakery, Levain, and other appropriate supplied bakery/bagel entries are visible according to neighborhood and verified locations. Bar Pisellino may also be included as a café/bar because its official site describes espresso service. The map maintains the same filter and selection. A selected result is highlighted in both views.

### Desktop Saved

Drawer shows all saved entries by default. The rest of the map shows saved resolved locations and the relevant neighborhoods. A user's previous Explore category must not accidentally hide saved entries in the list. Provide clear return to Explore and optional saved-only filtering. Keep total Saved count distinct from any filtered count.

### Mobile (390 × 844; test 360px minimum)

Small compact title; chip row scrolls horizontally without horizontal document overflow. Search can compact into a single reachable bar. Explore map/list and Saved are easy to reach. On open place details, the map is padded/repositioned to keep the pin above the sheet. Browser keyboard opening must not bury the search field or clear button.

### Tablet

Use the mobile sheet when a side drawer would consume too much of the map. Choose breakpoints based on usable space, not device labels. Test around 768px and orientation changes.

## Motion specification

| Trigger | Motion | Timing |
| --- | --- | --- |
| First load | Header/chips fade and rise 6px after data/UI ready; map loads independently | 180–240ms, one time |
| Filter selection | Pressed chip settles 1–2px; marker changes fade | 120–180ms |
| Pin selection | Halo fades in; optional scale 1 → 1.08 → 1 | 180–240ms |
| Save | Bookmark fills; count updates immediately; subtle 1.06 scale | 160–220ms |
| Drawer/sheet | Short eased translation with fade | 200–260ms |
| Focus neighborhood/place | Smooth geographic camera move with modest travel | 500–800ms |
| Close/return | Restore prior context without a dramatic fly-through | 180–300ms UI; camera only if useful |

Respect `prefers-reduced-motion`: remove decorative transforms, use immediate camera jumps or short fades, disable ambient effects. No autoplay sound. Optional ferry/water ambience must be very subtle, pause offscreen, and never represent live ferry tracking. Do not add ambient motion until the core app performs well.

## Visual rejection criteria

Reject a result with a default blue/white map UI, giant hero headline, card grid as the only experience, flat screenshot pretending to be a live map, unreadable tiny pixel text, Manhattan-only coverage, hidden café filter, hard-to-find Saved, excessive labels, arbitrary place positions, or unstyled fallback/error screens. Compare actual screenshots with the reference images before declaring the design complete.
