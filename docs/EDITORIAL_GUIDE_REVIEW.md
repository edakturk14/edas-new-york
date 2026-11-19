# Editorial guide layout

Latest direction, November 18, 2026: use the first editorial mockup, remove Find Eda, and retain the existing interactive geographic map. This supersedes earlier instructions to put all desktop filters above the map and retain the character hunt.

## Implementation

- Centered title in a 76 px cream header, with a quiet byline, Before you go, and Saved count.
- A 288 px address-book sidebar: introduction, search, category menu, neighborhood filter, two working shortcuts, and a simple footer. At smaller desktop widths it is 250 px.
- The existing MapLibre map is inset in a rounded frame. Its geographic data, miniature geometry, tile provider, fixed pitch/bearing, close opening zoom, and ambient ferry/steam/dog remain. The generated illustration is not shipped as a map background.
- Greenpoint / All New York and Map / List controls live inside the map frame. Category filters still preserve the camera. Layout-dependent camera padding now measures the map and panel rectangles, with limits to leave usable space for fitting locations. A ResizeObserver updates canvas dimensions without rebuilding the map.
- Results and Saved open on the right and collapse into a narrow rail. Closing or collapsing does not delete the collection. Search/category/neighborhood controls stay available in the sidebar.
- Selected-place cards sit at the lower right with a compact image/illustration beside the name, Eda's note, Save, directions, and the existing factual/branch information. Photo credits and not-visited badges are preserved.
- Greenpoint, slowly opens the existing Greenpoint collection; Brooklyn to Manhattan opens the existing Brooklyn Bridge walk. No invented itinerary or recommendation content was added.
- Find Eda's avatar, controls, persistence callbacks, reveal motion and celebration are no longer mounted. Existing saved-place data is not changed or migrated.
- At phone widths the sidebar becomes horizontal filters and search; the bottom Saved navigation and scrollable detail sheet remain.

No new dependency, paid service, account requirement, or API key. The creator-interest pilot is a separate PR and is not silently bundled into this design change.

## Verification performed

| Check | Result |
| --- | --- |
| TypeScript + production build | Passed. Existing MapLibre chunk-size warning remains. |
| Node test suite | All 30 tests passed. |
| Cafés + Greenpoint | Radio Bakery and Bakeri are shown; Food changes this to six results. |
| Collapse and change filter | Rail remains collapsed, count updates, and expanding restores the list. |
| Detail and directions | Correct Radio/Bakeri note and branch-specific Google Maps link remain available. |
| Save and reload | Saved Bakeri's Greenpoint branch; reload retained it alongside the two existing local QA bookmarks. |
| Remove and Undo | Count and bookmark restored; announcement confirmed restoration. |
| Keyboard preview | Tabbing through Radio's row opens the preview; Escape dismisses it without closing results. |
| Unvisited content | Lucali retains its explicit not-visited badge and original note. |
| Narrow layouts | Same-origin local QA frames at 390×844, 360×800 and 768×1024 had no horizontal document overflow. Café filtering and opening Radio worked at 360; Saved list opened at 390. This is viewport QA, not a physical-device test. |
| Desktop screenshot | Actual browser at 1363×936, with the new sidebar and compact Radio card. |
| Real 3D rendering, map-pin clicks, frame rate, camera composition | Not verified: this cloud browser cannot initialize the existing WebGL2 map. The application's real map-failure state is deliberately visible in screenshots. |
| Legacy full-map browser scripts | Updated the illustrated-map script to assert removal of the character hunt. Not run here; they need a WebGL-capable browser. |

## Browser evidence

These are real interface screenshots, not generated mockups. The blank map and error message show the QA browser's WebGL limitation.

![Desktop guide with compact Radio Bakery card and map fallback](qa/editorial-place-desktop.jpg)

![390 px Saved list with map fallback](qa/editorial-phone-saved.jpg)

## Review before merging

Use the branch preview in a WebGL2-capable browser. Confirm the inset map renders, a selected place stays left of the right-hand detail card, and pan/zoom plus Greenpoint/All New York still work. Try Walks & parks from a close view; it should change the results without zooming out. Open a walk, use Saved → Show all on map, and check pins/attribution remain clear of the new panels. The map model and data files are unchanged, but its viewport and camera padding have changed and need that visual check.
