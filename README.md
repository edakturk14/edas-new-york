# Eda's New York

**Eda's Travel Guide** is a personal, interactive New York guide for friends visiting the city: Eda's recommendations, a playful miniature city map, easy café and food discovery, and saved places that are useful on a phone.

The working React/TypeScript app is in `src/`, alongside the original implementation handoff and visual references.

## Run locally

Use Node 20 or newer. Run `npm install`, then `npm run dev` for development. Run `npm test` for the 28 focused content/state/photo/spreadsheet tests and `npm run lint` for TypeScript checks. For the production preview run `npm run build`, then `npm run preview -- --host 127.0.0.1 --port 4173` and open http://127.0.0.1:4173. With that preview running, `npm run test:browser` runs seven isolated local browser regressions using the installed `agent-browser` CLI. No account, token, or environment secrets are needed. The geographic basemap needs internet access; the list and device-local saves remain usable if the map fails.

To add or edit an ordinary place, use the spreadsheet described in [Add or edit a place](#add-or-edit-a-place). Other recommendations (walks, areas, activity guides, multi-branch places) are edited directly in `docs/content/guide-seed.json`, keeping IDs and Eda's original notes stable. Verified branches live separately in `src/data/locations.json`; include address, geographic coordinates, branch label, source URLs and fact-check date. Areas and broad activities do not need invented point coordinates. Run `npm test` and preview the result after edits. Save data stays in this browser under `edas-new-york:saved:v1`.

## Add or edit a place

Ordinary places (one address, one map pin) live in a spreadsheet: [`docs/content/places.csv`](docs/content/places.csv). Walks, parks, areas, activity guides, the two-branch Bakeri entry and photos stay in the JSON files described below.

1. Open `docs/content/places.csv` in Google Sheets (File → Import → Upload, then "Replace spreadsheet") or Numbers.
2. Add a row, or edit an existing one. One row is one place:

   | Column | What to put in it |
   | --- | --- |
   | `id` | Leave empty for a new place; the script fills it in from the name. Don't change it later, because visitors' saved places use it. |
   | `name` | Required. For example `Radio Bakery`. |
   | `categories` | Required. One or more of `cafes`, `food`, `bars`, `museums`, `walks`, `activities`, separated by commas. The labels work too, like `Cafés & bakeries, Food`. The first one picks the map icon. |
   | `neighborhood` | Required. A known neighborhood, like `greenpoint`, `Williamsburg` or `West Village`. The checker lists every option if one is not recognized. |
   | `address` | Required. The full street address used for directions. |
   | `latitude`, `longitude` | Required. See "Copy coordinates from Google Maps" below. |
   | `eda_note` | Your note, exactly as visitors should read it. Leave it empty if you have no comment; the app never invents one. |
   | `description` | Optional. One neutral sentence about the place. |
   | `website` | Optional. The official link, starting with `https://`. |
   | `tags` | Optional. Extra search words, separated by commas, like `brunch` or `dinner`. |
   | `eda_hasnt_been` | Write `yes` to show "Eda hasn't been yet". Otherwise leave it empty. |

3. Download the sheet as CSV (Google Sheets: File → Download → Comma-separated values; Numbers: File → Export To → CSV) and save it over `docs/content/places.csv`.
4. Run `npm run places:check`. It changes nothing; it lists every problem with its row number (missing fields, unknown categories or neighborhoods, coordinates outside New York or swapped, duplicate ids, links without `https://`) and the changes it would make.
5. Run `npm run places` to write the changes into `docs/content/guide-seed.json` and `src/data/locations.json`, then `npm test` and `npm run dev` to look at the place on the map.

To remove a place, delete its row and run `npm run places`. A place with a photo cannot be removed this way until its photo record is deleted. `npm run places:export` rewrites the CSV from the current data if you ever need a fresh copy.

### Copy coordinates from Google Maps

1. Find the place in [Google Maps](https://www.google.com/maps) on a computer.
2. Right-click the exact spot (the entrance, not the middle of the block). The first line of the menu shows two numbers, like `40.73239, -73.95506`.
3. Click those numbers to copy them.
4. Paste into the `latitude` cell. You can leave `longitude` empty: the checker splits the pair. Or put the first number (about `40.7`) in `latitude` and the second (about `-73.9`) in `longitude`.

On a phone, press and hold the spot to drop a pin; the coordinates appear in the search box at the top.


![Approved visual direction: a wide miniature New York map](docs/design/approved-city-overview.webp)

## Start here

1. Read [AGENTS.md](AGENTS.md) and the [implementation brief](docs/START_HERE.md).
2. Inspect the [design references](docs/design/README.md), including the desktop Saved view and mobile detail view.
3. Follow the [product requirements](docs/PRODUCT.md), [design specification](docs/DESIGN.md), and [interaction specification](docs/INTERACTIONS.md).
4. Use the [architecture](docs/ARCHITECTURE.md) and [content/data contract](docs/CONTENT_AND_DATA.md).
5. Implement against the [acceptance checklist](docs/ACCEPTANCE.md).
6. See the [Factory Workstream kickoff](docs/FACTORY_WORKSTREAM.md) for the complete task and suggested work packages.

## Content and assets

- [Eda's original New York notes](docs/content/eda-original-notes.md): source of truth for her personal recommendations and opinions.
- [Structured seed content](docs/content/guide-seed.json): 52 guide entries, including all 43 original IDs and the owner's subsequent additions, with categories, provenance, and explicit unknowns.
- [Visitor notes](docs/content/visitor-notes.md): publishable guidance and corrections to time-sensitive details.
- [Design tokens](docs/design/tokens.json): colors, dimensions, type roles, and motion values.
- [Sources and verification](docs/SOURCES.md): official technical/transit references and research requirements.
- [Source-built animation reference](docs/references/waldo/REUSE_GUIDE.md): exact reusable patterns from Waldo Stripes Soft, pinned source snapshots, adaptation notes and MIT attribution.

## What matters most

- The app opens into a beautiful, interactive geographic city map, with Manhattan, Brooklyn, Greenpoint, Williamsburg, and Long Island City in view.
- **Cafés & bakeries** and **Food** are obvious, one-tap filters.
- People can save from cards and place details, then open an equally obvious **Saved places** view.
- Bookmarks survive reload on the same browser without an account.
- The desktop and mobile experiences are both deliberately designed.
- The map is a real map with geographic coordinates, not a generated screenshot with percentage-positioned buttons.
- Eda's personality comes from her actual notes. Do not invent reviews, visits, ratings, opening hours, or recommendations.

## Visual hierarchy

The approved overview establishes the color and miniature-city direction. Written requirements take priority when a reference image differs: the final app must include a prominent café filter and a unified Saved collection. The earlier "My day" mockup control is not a separate required v1 feature.

Design images are references, not production map tiles or photographs of businesses. See [asset provenance](docs/design/README.md).

## Implementation target

Suggested stack: React, TypeScript, Vite, MapLibre GL JS, a customized map style, and browser-local bookmark storage. No AI model, login, database, or paid service is required for the core experience. Verify current dependency compatibility during implementation and commit the lockfile.

The completed app should document its install/dev/build/test commands here, plus how Eda can edit recommendations. Keep these handoff documents available after implementation.

## Creator interest pilot

A small “Make a guide like this” invitation and private creator inbox are included. **Before collecting real requests**, connect the server storage and owner access key using [the activation guide](docs/CREATOR_PILOT.md). Without setup the form shows an honest unavailable state. Saved places still work without an account.

The same document covers follow-up statuses, CSV exports, optional aggregate counts, local testing and how to manually adapt the guide for the next creator/city.
