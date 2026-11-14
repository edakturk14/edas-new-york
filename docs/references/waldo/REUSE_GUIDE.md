# Waldo Stripes Soft: what to reuse for Eda's guide

User-supplied reference: [gokayfem/waldo-stripes-soft](https://github.com/gokayfem/waldo-stripes-soft).
Source snapshot reviewed: `ac4f9688f8ed2351a692d75c341c8f261abbfe76` on 2026-11-14.

## Recommendation

This is a useful reference for the **source-built miniature-world layer**: modular geometry, controlled colors, soft lighting, small moving props, smooth camera response and performance discipline. Keep the actual NYC geography and recommendation data separate. The best initial fit is a geographic map with selectively adapted 3D scenery/landmarks and the approved UI palette, rather than importing the entire fictional town/game.

Not using image/model assets is an advantage for scalable decorative scenery: a house, tree, awning or boat can be generated with parameters, recolored and animated. It does not automatically generate an accurate New York map or a real business's façade. We still need geographic land/streets/locations, and can use properly sourced images in cards if desired.

## Findings from actual source inspection

| Source file | What it does | Useful application | Adaptation requirement |
| --- | --- | --- | --- |
| [core/palette.ts](https://github.com/gokayfem/waldo-stripes-soft/blob/ac4f9688f8ed2351a692d75c341c8f261abbfe76/src/core/palette.ts) | Central color tokens, sRGB-to-linear conversion and coordinated light/shade helpers | Consistent materials across buildings, trees and props | Replace base colors with Eda's approved tokens; don't import the upstream palette as the final design |
| [core/rng.ts](https://github.com/gokayfem/waldo-stripes-soft/blob/ac4f9688f8ed2351a692d75c341c8f261abbfe76/src/core/rng.ts) | Seeded random utilities and independent named streams | Stable decorative variations in façades/trees without shipping hundreds of assets | Use fixed seeds derived from stable geographic/feature IDs; never randomize recommendation locations or neighborhoods |
| [props/arch/house.ts](https://github.com/gokayfem/waldo-stripes-soft/blob/ac4f9688f8ed2351a692d75c341c8f261abbfe76/src/props/arch/house.ts) | Assembles a house from façades, roof and cached parts | NYC-specific low-rise/brownstone kit | Depends on geometry kit and several architecture modules; not a standalone drop-in component |
| [props/arch/rowHouses.ts](https://github.com/gokayfem/waldo-stripes-soft/blob/ac4f9688f8ed2351a692d75c341c8f261abbfe76/src/props/arch/rowHouses.ts) | Produces varied terraces sharing party walls | Small Brooklyn streetscape/landmark scenes | Change gabled/half-timber defaults to appropriate NYC roof/stoop/water-tank details; anchor to sourced geography |
| [props/street/bakery.ts](https://github.com/gokayfem/waldo-stripes-soft/blob/ac4f9688f8ed2351a692d75c341c8f261abbfe76/src/props/street/bakery.ts) | Builds bread racks, baskets and pastry props from primitives | Original bakery/category illustration or modest selected-place decoration | Use only where visible at the chosen scale; do not imply the model is Radio Bakery's real interior |
| [render/worldMaterial.ts](https://github.com/gokayfem/waldo-stripes-soft/blob/ac4f9688f8ed2351a692d75c341c8f261abbfe76/src/render/worldMaterial.ts) | Shared matte vertex-color material, gentle shader-driven sway and depth handling | Restrained tree/plant movement, coherent soft materials | Uses custom geometry attributes and Three shader patching; port only with matching geometry and verified Three version |
| [world/dynamicProps.ts](https://github.com/gokayfem/waldo-stripes-soft/blob/ac4f9688f8ed2351a692d75c341c8f261abbfe76/src/world/dynamicProps.ts) | Instanced moving objects driven by shared motion records/shader transforms | A few decorative ferries or street props | Tightly connected to crowd uniforms/motion stores; a small CPU animation loop may be simpler for a handful of objects |
| [render/cameraRig.ts](https://github.com/gokayfem/waldo-stripes-soft/blob/ac4f9688f8ed2351a692d75c341c8f261abbfe76/src/render/cameraRig.ts) | Orthographic framing, drag/tap discrimination, inertial pan and exponential damping | Camera feel, input handling ideas and consistent miniature perspective | Its normal product mode intentionally disables zoom/orbit. Eda needs zoom; use the geographic map camera as owner rather than layering competing camera rigs |
| [world/staticWorld.ts](https://github.com/gokayfem/waldo-stripes-soft/blob/ac4f9688f8ed2351a692d75c341c8f261abbfe76/src/world/staticWorld.ts) | Batches scenery into spatial cells and prebuilds near/far geometry | Limit draw calls and unnecessary detail in custom scenery | Upstream's near/far assumptions relate to a mostly fixed game scale. Test across our much wider zoom range |
| [render/engine.ts](https://github.com/gokayfem/waldo-stripes-soft/blob/ac4f9688f8ed2351a692d75c341c8f261abbfe76/src/render/engine.ts) | Render loop, bounded pixel ratio, warm lighting, hidden-tab/paused behavior | Battery/performance discipline and cohesive light | Do not add a second independent renderer loop when MapLibre owns the canvas/context; adapt behavior to the chosen integration |
| [PERFORMANCE.md](https://github.com/gokayfem/waldo-stripes-soft/blob/ac4f9688f8ed2351a692d75c341c8f261abbfe76/PERFORMANCE.md) | Explains its profiling approach and measured limits | Inspiration for measuring frame pacing and draw calls | Their measurements are on one stated machine/browser and do not establish our app's performance |

## Source snapshots supplied

Small source snapshots are included under `source/` as `.ts.txt` files for inspection:
- `palette.ts.txt`
- `rng.ts.txt`
- `cameraRig.ts.txt`
- `worldMaterial.ts.txt`

These are unmodified reference copies from the pinned commit. They are **not installed runtime modules**, a complete dependency subtree, or a claim of compatibility with MapLibre/our app. The `.txt` suffix keeps them out of a future TypeScript build. Fetch additional upstream dependencies at the pinned revision only if the implementation actually needs them.

## Concrete scope for the first version

1. Keep the approved cream/plum/coral/blue palette as the single design system.
2. Prototype one small source-built scene anchored to a verified geographic area: a few brownstones, two trees, a café awning and a small waterfront boat. This proves appearance/performance without adopting an entire game engine.
3. Let a real geographic map provide coastline/streets/coordinate transforms and POI alignment. If using a Three custom layer, use current official MapLibre integration examples and a single coherent camera/context owner.
4. Use procedural shapes for decoration/landmarks, not false storefront photographs or a randomized NYC layout.
5. Add subtle ferry movement along a pre-authored decorative path and slight foliage movement only if core rendering is smooth. Do not label this as live ferry service.
6. Reuse seeded variation so a refresh does not rearrange the same street. Pin and bookmark IDs remain stable.
7. Keep camera pan/zoom and accessible HTML controls central; opening/saving a place should feel immediate.
8. Honor OS reduced motion and provide a quiet state. The upstream README explicitly says its normal UI does not adopt the OS setting automatically; that limitation must not be copied.

## Do not import wholesale

- Fictional seaside-festival district layout or random scene placement.
- The Waldo character, trademark identity, seek-and-find mechanics, timer, score, win screen or leaderboard.
- A 10,000-person crowd and its full animation/accessory engine. This guide does not need it.
- A startup modal that blocks the guide until Start is pressed.
- Fixed-scale/no-zoom behavior.
- Local-file leaderboard/server and local-only hosting assumptions.
- Its network-denying CSP unchanged: our geographic map needs allowed tile/font requests under a suitable policy.
- Upstream measured FPS/startup numbers as promises about our application.

The essential insight is **procedural decoration on stable geography**. Image assets are optional for the city presentation; geographic data and accurate place identity are not.

## Licensing and provenance

The inspected repository has an MIT license. Its full notice is retained as `LICENSE.upstream`. Any copied or substantially adapted code must retain that copyright/license notice in the relevant distribution and be recorded in the project's third-party notices. Do not remove author attribution when renaming/reorganizing code.

The MIT code license does not require Eda to use the Waldo brand or character; neither is part of the desired app. The supplied snapshots are for implementation reference. No external code has been installed into a running application by this handoff.

## Review limits

This assessment is based on README/license/performance documentation and the named source files. The upstream app was not run or benchmarked in this session. Inspect its actual running scene during implementation if you need to validate a motion impression or reuse a shader. Treat all performance and integration decisions as things to verify in our own build.

