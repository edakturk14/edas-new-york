# Instructions for agents working in this repository

## Goal

Build the actual Eda's Travel Guide web app from the handoff. This is a personal NYC guide with a whimsical miniature-city/game aesthetic. The primary workflow is discover a café or food place, inspect Eda's note, save it, and find it again in Saved places.

## Read first

Read `docs/START_HERE.md`, then the documents it references. Open the actual images in `docs/design/`; do not infer the design from filenames. Written interaction/data requirements override illustrative text, pin positions, or counts in a mockup.

## Product and design constraints

- Keep the title **Eda's Travel Guide** centered at the top.
- Preserve the approved palette: blue water, warm cream panels, dark plum outlines/type, coral selection, green parks, lavender accents.
- Create a wide, tilted geographic city view that includes Brooklyn and Long Island City. A Manhattan-only skyline fails the brief.
- A real map with geographic POIs is required. Do not ship a full mockup image with hotspots, a generic unstyled map, or an unrelated map of another city.
- Make `Cafés & bakeries`, `Food`, and `Saved` easy to find and operate on mobile and desktop.
- Use a single bookmark collection in v1. Do not replace it with a three-slot itinerary or require account creation.
- Preserve all provided recommendations and explicit "I haven't been" notes. Missing comments remain missing.
- Never claim fabricated opening hours, live availability, ratings, location precision, or optimal routes.
- No AI/chat/voice feature is required. Do not port the cake builder's domain model, image-generation backend, prices, or basket UI.

## Working approach

Start by validating the map, wide-view camera, building detail at relevant zooms, and readable POI overlays. Then establish data/state contracts and complete the discover/save/revisit flow. Use the suggested work packages in `docs/FACTORY_WORKSTREAM.md` if running a multi-agent workstream; integrate through one owner.

Make ordinary implementation decisions within this brief. Keep a short `docs/IMPLEMENTATION_NOTES.md` explaining meaningful tradeoffs, dependency versions, map-data limitations, and unresolved external facts. Do not stall for approval on routine spacing, component, or naming choices.

Use the environment's normal branch/PR workflow. Do not overwrite unrelated work or rewrite existing history. Keep secrets out of source and screenshots. Do not introduce a paid service as an unannounced dependency.

## Completion

Passing a build alone is insufficient. Complete the user flows in `docs/ACCEPTANCE.md`, inspect the browser at desktop and phone sizes, and provide screenshots with the finished PR. Document actual results and any remaining limitation. Do not report visual QA, external-source verification, or persistence tests as passed unless performed.

There is no deployment obligation in this handoff. Deliver working, reviewed code and a preview using the workstream's available tooling; do not change unrelated hosting projects.
