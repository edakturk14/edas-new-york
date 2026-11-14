# Product requirements

## Audience and voice

Primary audience: Eda's friends visiting NYC, often with limited time and using a phone while out. Secondary audience: people who discover the guide through her website or social posts. The product is personal and selective; it is not an exhaustive city directory.

Use plain, concise language. Keep Eda's notes recognizable: "fav", "spicy!!", "cookies!!!", "martini!!" can be lightly edited for readability but not expanded into invented experiences. Never fill silence with generic promotional prose.

## Required surfaces

| Surface | Purpose | Required controls |
| --- | --- | --- |
| Explore map | Understand where Eda's places are | Pan/zoom, category pins/clusters, reset view, neighborhood selector, list toggle |
| Explore list | Scan recommendations without navigating the canvas | Search, categories, neighborhood, result count, clear filters, save buttons |
| Place detail | Understand a recommendation and act | Category, location/branch, Eda's note, visit-status badge when relevant, save, directions, source/official link when verified, close |
| Saved places | Retrieve the visitor's bookmarks | Count, list, saved-map view, remove/undo, show all on map, copy list, empty state |
| Before you go | Practical visitor notes | Subway/ferry guidance, weekend alerts, reservations guidance, Greenpoint notes, official links |
| Neighborhood guide | Explore the user's area suggestions | Area note, related places, focus map, save the area guide |

## Navigation

Desktop: compact top-center title with filters below; Before you go at upper-left; a prominent bookmark button **Saved N** at upper-right. Search and neighborhood selector are reachable below the main filters. One main drawer at a time: results, details, or saved collection. Small zoom/reset controls sit in a safe bottom corner.

Mobile: compact title and useful small header actions; a horizontally scrollable category strip; compact search/neighborhood controls; bottom tabs **Explore** and **Saved** with a numeric badge. Place details open in an accessible bottom sheet. A List/Map toggle is always reachable from Explore.

Do not create a separate landing page requiring a "Start exploring" click before showing the guide. Do not require a tutorial, login, geolocation permission, or email address.

## Categories

Default order: **All spots**, **Cafés & bakeries**, **Food**, **Bars**, **Museums**, **Walks & parks**, **Activities**. Neighborhoods are a separate filter/guide, not a competing content category row.

- Cafés & bakeries is first after All. It includes actual café, bakery, and bagel tags. Do not classify every restaurant or a business with "Caffè" in its name as a café without evidence.
- Food includes meals, pizza, bagels, tacos, noodles, dumplings, restaurants, and desserts. Overlap with bakeries is intentional.
- Bars includes Bar Pisellino, Dante, Westlight. A verified daytime café/bar can appear in both relevant filters.
- Museums includes all four supplied museums. The Met alone has an explicit favorite note.
- Walks & parks includes the supplied outdoor suggestions. Routes, parks, and neighborhoods should not pretend to be restaurants at a single arbitrary point.
- Activities includes broad suggestions as guide cards as well as resolvable venues. "Sports" is not a license to invent a specific event or stadium recommendation.

Use stable taxonomy IDs in data; labels are presentation. Categories combine with neighborhood and search as defined in `INTERACTIONS.md`.

## Bookmark collection

Saving must work from a compact result card and the open detail view. The default action says **Save** with an outline bookmark; the selected state says **Saved** with a filled bookmark. The same icon convention applies everywhere. Include the place name in accessible labels.

Saved is an unlimited collection for v1. Its count reflects unique guide entries, not rendered map markers or duplicated chain branches. All screens update from the same state. A selected branch may be retained as the preferred location without creating accidental duplicates.

Saved collection should offer:

- all saved entries with Eda's note where present;
- grouping or filtering by neighborhood/category without losing items;
- a map showing only saved, geographically resolved locations;
- **Show all on map** fitting geographic saved places with appropriate padding;
- directions for a resolved preferred location, or **Choose location** when needed;
- one-tap removal and a short-lived **Undo** action;
- **Copy list** with names, neighborhoods, optional address, and links;
- a concise note that saves live on this device/browser.

No automatic booking, tracking, or outbound messages. Copy/share actions only occur in response to the visitor's explicit click.

## Place information hierarchy

1. Name, with a branch label if one is selected.
2. Neighborhood and category.
3. Eda's personal note, if any.
4. **Eda hasn't been yet** if explicitly supplied.
5. Save and directions actions.
6. Verified address, official website/reservation page, source/check date where applicable.

Use a small category illustration when there is no properly sourced photo. The app must still look finished without photos. Never present a generated storefront image as a photo of the real establishment.

## Content completeness

Retain all 43 original guide entries. Some are areas or activities, not point locations. The corpus may grow into more branch records, but it must not silently lose an original entry. Explicit unvisited entries: **Guggenheim, Lucali, Katz's Delicatessen, Bernie's**. LIC should have geographic coverage even though Eda has not supplied a specific LIC recommendation. Show a friendly truthful empty state rather than adding unsolicited picks.

## Practical notes

Place these in Before you go. Use `content/visitor-notes.md` for corrected copy and official sources. In particular, the NYC Ferry app is not the only way to purchase a ticket; landing ticket machines also accept cards. Airport routes depend on the airport and service at the time. Do not publish a universal "two subways" claim.

## Non-functional expectations

- Works at 390px mobile and common desktop widths; no clipped titles or inaccessible save controls.
- Functional content appears before the map finishes loading.
- A map/tiles/WebGL failure leaves search, cards, and saved places usable.
- Keyboard and assistive-technology users can complete the core flow without manipulating the map canvas.
- No secrets or paid credentials required to browse and save the guide.
- User preferences and personal notes stay separate from external factual metadata.
