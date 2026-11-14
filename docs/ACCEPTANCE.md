# Acceptance and verification

These are requirements for the future implementation. No application tests have been run by creating this documentation package. During implementation, copy the results into `docs/ACCEPTANCE_REPORT.md` with actual commands, browser evidence, dates and any limitations.

## Functional checklist

- [ ] First visit opens directly to the city guide, not a marketing landing page.
- [ ] Title reads Eda's Travel Guide and is centered at desktop and mobile sizes.
- [ ] Cafés & bakeries, Food, and Saved are obvious, reachable controls.
- [ ] Café + Greenpoint finds Radio Bakery; Food + Greenpoint finds Taqueria Ramirez.
- [ ] Map and list apply the same category/neighborhood/search logic.
- [ ] Search handles `L'industrie`, `Lindustrie`, Unicode apostrophes and case differences.
- [ ] Clearing filters restores all applicable guide entries.
- [ ] Empty results offer a clear reset rather than silently changing criteria.
- [ ] Opening a card/pin selects the same data record and keeps its pin visible.
- [ ] Save buttons work without accidentally triggering card navigation.
- [ ] The same bookmark state appears on cards, details, map badge, Saved view and count.
- [ ] Save four different entries, reload and reopen Saved: all four remain.
- [ ] Rapid double toggles and duplicate locations do not create duplicate saved entries.
- [ ] Remove one entry: it disappears from Saved, count updates, Undo restores it.
- [ ] Remove the final item: the designed empty state appears.
- [ ] Saved filters do not inherit a restrictive Explore filter by accident.
- [ ] Saved map mode displays only saved resolved locations; non-point guides remain accessible in the list.
- [ ] Show all on map handles 0, 1, several and geographically unresolved saved entries.
- [ ] Copy list succeeds or presents a truthful fallback; it includes branch/address only when known.
- [ ] Stable place deep links work on initial load, refresh and browser back.
- [ ] Invalid query parameters recover cleanly.
- [ ] Directions open the intended verified branch or correctly prompt Choose location.
- [ ] Before you go includes the corrected ferry guidance and no universal two-subway airport claim.

## Content checks

- [ ] All 43 original editorial entries exist in the final content representation.
- [ ] Original source notes remain traceable and no new first-person review was invented.
- [ ] Four unvisited entries retain the explicit badge: Guggenheim, Lucali, Katz's, Bernie's.
- [ ] The Met's explicit favorite note is preserved.
- [ ] Radio Bakery uses the Greenpoint branch.
- [ ] Multi-location entries have verified branch labels and source references.
- [ ] No specific business has a fabricated coordinate or an area centroid passed off as its entrance.
- [ ] Every plotted named venue has address/coordinate provenance.
- [ ] No invented opening hours, prices, ratings, event schedules or route times.
- [ ] LIC is visible but does not contain invented Eda recommendations.
- [ ] Photos/illustrations and third-party code have source/license records.
- [ ] Required map/data attribution remains visible and usable.

## Visual checks

Capture actual browser screenshots at 1440×900, 1280×800, 390×844, and a minimum-width 360px viewport. Also inspect a tablet/orientation change.

- [ ] Wide overview gives Brooklyn and LIC meaningful space.
- [ ] Palette, miniature-city depth, cream/plum HUD and coral interactions match the direction.
- [ ] The delivered app is not an unchanged default map style or a screenshot with hotspots.
- [ ] Category pins remain readable against dense buildings and don't cover each other indiscriminately.
- [ ] Camera padding keeps selected pins clear of drawers/sheets.
- [ ] Header/filter rows do not dominate or cover the usable map area.
- [ ] Café chip is reachable on phone without a hidden settings menu.
- [ ] Saved drawer/list and empty state are as considered as Explore.
- [ ] Save/close/navigation controls meet touch target sizes.
- [ ] No horizontal document scrolling, clipped labels, or actions hidden under safe areas.
- [ ] Text remains legible in rendered contrast, including coral active chips.
- [ ] Generated-reference geography/artifacts were not copied as factual place locations.

## Accessibility and resilience

- [ ] Complete discover → detail → save → Saved → remove with keyboard alone.
- [ ] Dialog/sheet focus and Escape/close behavior are correct; focus returns sensibly.
- [ ] Screen-reader labels include place names and bookmark state.
- [ ] Save/remove announcements are polite and not duplicated.
- [ ] Reduced motion disables decorative movement and large camera flights.
- [ ] Unsupported WebGL or blocked tiles leaves a useful list/save experience.
- [ ] localStorage read/write denial does not crash and does not falsely promise persistence.
- [ ] Corrupted storage recovers safely; current schema validation/migration is tested.
- [ ] Cross-tab bookmark changes synchronize without duplicates.
- [ ] Missing media uses a polished category fallback.
- [ ] Clipboard rejection has an honest fallback.
- [ ] Map failure/retry does not reset bookmarks or filters.

## Meaningful automated tests

Write focused tests for filtering/search normalization, canonical ID/branch behavior, storage validation/migration, duplicate suppression, copy-list serialization and directions URL encoding. Do not fill the suite with snapshots that merely mirror implementation.

Browser tests should cover the five release-critical scenarios in `START_HERE.md`, plus at least storage failure and map failure. Mock external tile/network failures deterministically where appropriate, but also perform a real browser map check with actual tiles. A mocked map test does not prove geographic rendering or visual quality.

Run the configured typecheck, relevant tests and production build. Test the built preview. Record commands and actual outcomes; do not invent test results or assume that unit tests prove mobile usability.

## Animation / reference-specific checks

- [ ] If using Waldo-derived ideas/code, the source commit and attribution are recorded.
- [ ] No fictional town layout, randomized POI locations, fixed no-zoom camera, leaderboard or crowd game leaked into this guide.
- [ ] Ambient ferries/people are clearly decorative, not shown as live transit tracking.
- [ ] Pause/reduced motion and hidden-tab behavior work in this application, regardless of upstream defaults.
- [ ] Profile the completed scene rather than quoting upstream performance numbers as this app's results.

## Delivery evidence

Provide a working preview, coherent PR/diff, README commands, content editing instructions, screenshots of overview/café filtering/selected place/Saved/mobile, acceptance report and implementation notes. Record unresolved venue facts individually. Do not mark a release complete while core save persistence, map alignment, café discovery or mobile Saved navigation is broken.
