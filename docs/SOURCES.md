# Sources and verification ledger

Prepared 2026-11-14. These sources informed the handoff. They are not proof that every venue in the seed has been geocoded or that a future build works.

## Personal recommendations

- Eda's list supplied in the conversation, preserved in `content/eda-original-notes.md`.
- Personal comments, favorites and visit status come from Eda, not external reviews.

## Official technical sources

| Source | Used for |
| --- | --- |
| [MapLibre GL JS](https://maplibre.org/projects/gl-js/) | Geographic rendering and custom visual layers as implementation options |
| [MapLibre building extrusion example](https://maplibre.org/maplibre-gl-js/docs/examples/display-buildings-in-3d/) | Building source/height fields and zoom-dependent extrusion example |
| [MapLibre elevated view example](https://maplibre.org/maplibre-gl-js/docs/examples/set-center-point-above-ground/) | Another example with a different minimum zoom; reinforces verifying actual source coverage |
| [MapLibre examples](https://maplibre.org/maplibre-gl-js/docs/examples/) | Current custom-3D/Three.js integration references to inspect during implementation |
| [OpenFreeMap](https://openfreemap.org/) | Public tile source, attribution and service constraints |
| [OpenFreeMap quick start](https://openfreemap.org/quick_start/) | Current integration, style customization and Vite worker setup |
| [OpenFreeMap terms](https://openfreemap.org/tos/) | Service/bulk-download constraints; no blanket offline-cache assumption |
| [Google Maps URLs](https://developers.google.com/maps/documentation/urls/guide) | Implementation reference to verify for external destination links |
| [Factory Workstreams quickstart](https://docs.factory.com/workstreams/quickstart) | Create workstream and send an initial goal/constraints/verification task |
| [Droid CLI quickstart](https://docs.factory.com/droid-cli/quickstart) | Starting `droid` inside a repository |

The Google Maps URLs guide is provided as an implementation reference; its detailed parameter behavior should be checked before use. Dependency examples are not a version guarantee; verify against the actual installed versions.

## Transit / visitor facts checked

- [MTA OMNY guidance](https://www.mta.info/document/107486): contactless card/mobile-wallet tap payment.
- [NYC Ferry FAQ](https://www.ferry.nyc/about/faq/): advance ticket purchase, landing ticket machines and accepted payment methods.
- [NYC Ferry ticketing info](https://www.ferry.nyc/ticketing-info/): app and landing machines as purchase options.

Do not copy prices, transfer durations or schedules from older pages without a new check. The guide should link to current official information instead of claiming live status.

## Venue facts checked in this handoff

| Entry | Source | Supported facts | Still needed |
| --- | --- | --- | --- |
| Radio Bakery | [Official Greenpoint location](https://www.radiobakery.nyc/locations-1) | Greenpoint, 135 India Street, Brooklyn | Verified coordinates/entrance and current operational details if displayed |
| Bar Pisellino | [Official site](https://barpisellino.com/) | Espresso service, West Village address, no-reservations statement | Verified coordinates/branch record; recheck operational details before publication |

All other venue facts remain part of the implementation's enrichment task. Do not label the entire content corpus "verified" because these two records have sources.

## User-supplied code reference

Repository: [gokayfem/waldo-stripes-soft](https://github.com/gokayfem/waldo-stripes-soft).
Inspected commit: `ac4f9688f8ed2351a692d75c341c8f261abbfe76`.
See [reuse guide](references/waldo/REUSE_GUIDE.md) for exact file links, observations, adaptation requirements and retained MIT license.

Review performed: README, license, package, performance writeup, and selected rendering, geometry-composition and animation source. The upstream application was not executed or benchmarked for this handoff. Its measured performance cannot be presented as this guide's results.

## Images

Generated visual mockups and the user-uploaded aerial reference are documented in `design/README.md`. They are design inputs, not factual maps, runtime screenshots or venue photography.
