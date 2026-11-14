# Third-party notices

## Runtime map and fonts

MapLibre GL JS is BSD-3-Clause licensed. OpenFreeMap/OpenMapTiles map tiles derive from © OpenStreetMap contributors (ODbL). The bounded local `public/data/nyc-overview.geojson` building layer derives from OpenFreeMap's 20261101 tile snapshot, prepared 2026-11-14; it contains sampled real footprints, not original geographic data. Preserve the visible map attribution and OpenStreetMap copyright link. The preparation script's download conforms to the provider's bounded offline-download terms inspected that day.

DM Sans and Pixelify Sans are bundled from Fontsource under the SIL Open Font License; license files remain in their installed packages. All application icons/category illustrations are original SVG path artwork. No generated storefront photographs or full reference mockups are runtime imagery. Waldo source was inspected as a design reference, not copied into the runtime.

## Place photographs

`src/data/place-photos.json` and `src/data/area-photos.json` record the source, credit and license status for32 openly licensed local photographs under `public/images/places/`. Wikimedia images retain their stated licenses; displayed images may be resized, JPEG-compressed and cropped. Credits and license links appear on detail cards. Per the owner's publication choice, photographs without confirmed reuse permission are excluded from public assets and the affected entries use original category illustrations.

## Waldo Stripes Soft reference snapshots

The files in `docs/references/waldo/source/` are unmodified inspection copies from [gokayfem/waldo-stripes-soft](https://github.com/gokayfem/waldo-stripes-soft), commit `ac4f9688f8ed2351a692d75c341c8f261abbfe76`.

Copyright (c) 2026 Waldo Stripes Soft contributors. Licensed under the MIT License. The full notice is included in [LICENSE.upstream](docs/references/waldo/LICENSE.upstream).

These files are documentation references, not installed runtime dependencies. If copied/adapted into the implementation, retain the license and record the destination files here. Add other map, font, icon and media attributions as the implementation introduces them.

The user-uploaded aerial image is reference-only; see [image provenance](docs/design/README.md). Generated mockups are visual concepts, not factual map data or real venue photographs.

