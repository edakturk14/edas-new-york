# Factory Droid Workstream kickoff

## Where to use this

Create a workstream for the `edakturk14/edas-new-york` repository and use the message below as the first orchestrator task. A suitable workstream name is **Build Eda's New York interactive guide**. The repo currently contains a handoff package, not an implementation.

Factory's official workstreams guide describes choosing the repository environment and then sending the orchestrator a first message: <https://docs.factory.com/workstreams/quickstart>. UI labels may change; the task below is plain text and does not depend on an undocumented slash command.

## Copy-paste task

```text
Build the complete Eda's Travel Guide app in this repository.

Start by reading AGENTS.md and docs/START_HERE.md, then all linked product, design,
interaction, architecture, content/data and acceptance documents. Open the actual
reference images in docs/design/. Also read docs/references/waldo/REUSE_GUIDE.md:
I like that repo's code-built city and animation style, but our palette is the
approved city-quest palette and our geography is New York.

The experience should feel like a polished, whimsical miniature city game:
wide tilted 3D/isometric NYC, cream pixel-edged controls, plum type/outlines,
coral accents, blue water and soft green parks. Keep Eda's Travel Guide centered
at the top. Brooklyn, Greenpoint, Williamsburg and Long Island City must have
meaningful coverage alongside Manhattan.

My highest-priority flow is: easily find cafés/bakeries or food, filter by
neighborhood, open my personal note, save the place, and find it again in a
proper Saved places view. Save controls and the Saved count must be obvious
on desktop and mobile. Bookmarks must survive refresh without signup. Use a
single bookmark collection; a three-slot itinerary is not a replacement.

Implement real geographic panning/zooming and anchored pins, not an image with
hotspots. Validate the city-wide 3D/detail approach early. Use the Waldo repo
selectively for procedural building/prop patterns, palette/material logic,
camera feel and restrained ambient animation. Preserve MIT notices for any
copied code. Do not import its fictional layout, no-zoom restriction, Waldo
character, leaderboard, full crowd engine or local-only server configuration.

Use all 43 entries in docs/content/guide-seed.json and preserve my original
notes. The seed is editorial data: verify actual branch addresses and map
coordinates from appropriate sources before plotting precise venue pins.
Keep my explicit haven't-been notes. Do not invent reviews, favorite badges,
hours, prices, ratings, businesses, LIC recommendations or route times.

Use React/TypeScript/Vite with the documented geographic map approach unless
the early spike establishes a better approach that still meets the same
functional/design requirements. No AI model, account system or paid service
is needed for the core app. Keep the guide usable if map tiles/WebGL fail.

Split bounded work across map/scene, content verification, UI/bookmarks and
QA after agreeing shared data/state contracts. Use economical models for
straightforward content/UI/test tasks where practical, and use a stronger
model for complex map integration or persistent failures. One integration
owner should keep the final experience coherent.

Implement the app, not just a plan. Verify the production build and the full
discover/save/reload/revisit flow, mobile layout, keyboard use, reduced motion,
storage failures and map failures. Inspect actual browser screenshots against
the references, then fix visible mismatches. Follow docs/ACCEPTANCE.md.

Deliver a working preview and one coherent PR (or this environment's configured
review workflow), with desktop/mobile screenshots, real test results, an
acceptance report, implementation notes, and simple instructions for editing
my recommendations. Make routine implementation decisions yourself and keep
me updated. Clearly identify any genuine blocker or remaining limitation.
```

## Suggested work packages

These are coordination boundaries, not instructions to maximize the number of agents. The orchestrator should assign ownership so workers do not repeatedly overwrite the same files.

### 0. Integrator: contracts and map proof

Read the references, establish typed GuideEntry/PlaceLocation/SavedEntry contracts and design tokens, scaffold the app, and validate a wide geographic map with the required coverage. Decide how to provide 3D detail at overview and neighborhood zoom. Inspect `REUSE_GUIDE.md` before choosing procedural geometry. Record the architecture decision and the first real screenshot in implementation notes.

### 1. Content verification

Preserve the 43 seed entries and all personal notes. Research current official branch addresses, classify real café/bakery services carefully, verify coordinates, retain source links/check dates, and represent non-point activities/areas correctly. Deliver validated content records, branch-resolution notes and any unresolved facts. Do not edit rendering/state files.

### 2. Map and scene

Own the map style, camera/padding, geographic layers, level of detail, marker/cluster presentation and optional restrained source-built scenery. Ensure Brooklyn/LIC coverage. Keep no-zoom game restrictions and fictional layout out. Do not own the bookmark store or invent content records.

### 3. UI and bookmarks

Own header, obvious café/food filters, list/search/neighborhood controls, detail cards, mobile sheet, one persistent bookmark store, Saved list/map mode and Before you go. Match design tokens. Implement accessible empty/error states. Use the shared map adapter rather than making a second map instance.

### 4. Integration and QA

Run realistic browser flows, production build, data validation, persistence/failure tests and visual checks. Test wide desktop and phone sizes. Fix issues through the relevant owner. Deliver evidence and make the final README useful.

## Order and checkpoints

1. Real map/scene proof and contracts before deep UI polish.
2. Vertical slice: Radio Bakery → Save → reload → Saved → Directions.
3. Complete corpus, filters, branch choices, search and list/map parity.
4. Desktop/mobile visual pass and accessible interaction pass.
5. Small ambient animation pass only after core performance is sound.
6. Production verification, screenshots and coherent handoff.

Review checkpoints are internal workstream checks; don't stop at each checkpoint waiting for the user to approve routine implementation.

## Optional terminal start

For an installed/authenticated Droid CLI, start it from the repository and paste the same task:

```bash
git clone https://github.com/edakturk14/edas-new-york.git
cd edas-new-york
droid
```

If a checkout already exists, use it instead of cloning a second copy, and update it through the normal safe Git workflow. The Workstream app route is separate; do not invent a `droid workstream` command.
