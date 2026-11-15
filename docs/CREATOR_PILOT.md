# Creator pilot: invitation, private inbox and replication

## What this change does

The guide remains the homepage. A quiet **Make a guide like this** button replaces the bottom-right drag hint. It opens a cream-and-lavender invitation with a small illustrated postcard, keeping the map and saved places in place. The form collects email, city, an optional creator link, whether they already have a list, and explicit permission to email them about making a guide.

This is an interest list, not account registration or a self-serve map builder. Success is only displayed after the server acknowledges a durable storage write (or an already-existing request). No automated email is sent.

Creator follow-up lives at `/?creators=admin`. The private inbox supports:

- Newest-first requests, 25 per page and Load more.
- Interested → Contacted → Building → Published statuses.
- CSV export of **loaded** rows, explicitly labeled with the count. Load all pages to export all requests. User input is escaped against spreadsheet formula injection.
- Permanent removal with a second explicit confirmation, useful when someone asks to withdraw.
- Optional 30-day aggregate activity counts. Counts are actions, not unique people or conversion rates.

## Activation: required before accepting real requests

**Not activated by this PR.** The connected Vercel tool could see the correct Hobby team but returned no projects and a 404 for the known project ID. No storage, integration, credentials or hosting settings were created or changed. Until the required environment variables exist, the form says **The list isn’t open just yet** and the API returns 503 for submissions. It never silently drops requests.

In the existing **edas-new-york** Vercel project:

1. Open Storage / Marketplace, connect an **Upstash Redis** database to this project. Select a plan appropriate for a small pilot and check its quotas; no paid upgrade is required by the code. Use a non-evicting/durable database, not a disposable cache. Keep database access private. This supplies `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to the server.
2. Generate a random access key of at least 32 characters in your password manager. Save it there, then add it as the server-only environment variable `CREATOR_ADMIN_TOKEN`. This is the owner inbox credential. Never paste it into chat, GitHub, a public URL, or a `VITE_` variable.
3. Set `CREATOR_ANALYTICS_ENABLED=true` if you want aggregate counts. Set it to `false` or omit it to disable action counting while continuing to accept creator requests.
4. Apply these variables to Production and, if testing the PR, Preview. Redeploy the intended environment after setting variables.
5. Open the preview, submit a test email you control, then open the same preview's `/?creators=admin` and enter the access key. Confirm the request appears after refreshing, change its status, export it, and remove the test record. Then repeat the smoke test on production after merge.

Default namespaces separate `edas-new-york:production` from `edas-new-york:preview`. All preview branches share the preview namespace unless you set `CREATOR_DATA_NAMESPACE` to a branch-specific value. Do not point previews at the production namespace. `CREATOR_DATA_NAMESPACE` is optional; any override must preserve this separation.

The owner inbox is for Eda alone. Before inviting teammates, replace the shared owner access key with proper individual authentication and roles. The current key never goes into URLs or localStorage; locking the inbox clears it from React state. Do not share screenshots/exports containing real applicant emails publicly.

## Data and security contract

All server code is under `server/` and `api/`. It calls Upstash's official Redis REST API using native `fetch`; no new package dependencies. Credentials are server-only. They are not needed for the static build. `.env.example` contains names only.

Requests store: normalized email, city, profile URL, has-list value, explicit consent, consent version, created/updated timestamps, creator status and originating guide ID. No public endpoint returns requests. Record identifiers are HMACs of normalized email. Duplicate submissions do not overwrite the original request or reset a follow-up status; they receive the same generic confirmation to avoid revealing membership.

The insert and index update are one Redis Lua operation. Status changes read and update the latest record atomically. Deletes remove both record and index. Request data has no automatic expiry; Eda can remove it in the inbox and should review/delete inactive pilot requests when the pilot ends. Back up/export before migrating storage. Rotating the Redis token also changes the HMAC identity salt: do not rotate casually while collecting requests without a migration plan for existing IDs/deduplication.

The endpoint validates field lengths, email shape, consent and http(s) profile links. It requires JSON and same-origin browser mutations, limits payloads to 4 KB, includes a honeypot and applies distributed per-IP throttling (5 signup attempts/minute; 120 event attempts/minute; 10 failed admin attempts/minute). Rate-limit keys use HMACs and expire after 60 seconds; raw IPs are not stored by this application. Vercel infrastructure may have its own request logs. Do not enable body logging for these endpoints.

Use host-provided trusted `x-vercel-forwarded-for` on Vercel, or the direct socket address locally. Do not deploy this handler behind an arbitrary proxy that accepts client-supplied versions of that header. Rate limiting/honeypots reduce basic abuse but are not comprehensive bot protection. Monitor the pilot; add provider-side firewall rules or a verified bot challenge if abuse appears.

## Aggregate activity

Events: guide opened, place opened, place saved, category used, creator invitation opened, and newly saved creator request. Only a fixed event name is sent. The endpoint ignores other payload fields and never stores email, city, profile, search query, saved-place IDs, paths, referrers, location, device identifiers or visitor IDs as event data. No analytics cookies are added. DNT/GPC suppress browser events. The server's new-request counter is a count of accepted business records.

Counters are stored per UTC day and expire after 90 days; the inbox sums the latest 30 UTC calendar dates. Frontend events are best-effort and may be blocked, repeated across reloads, or missed when offline. No claims of unique visitors or exact conversion rates. A failed analytics write never changes a successful signup into an error. `creator_submitted` cannot be incremented through the public event endpoint.

## Reusing this guide before building a platform

Start with three manually made guides in distinct cities. Ask each creator for the list they already send friends, their own notes, a profile link, and photos they own or have permission to use. Preserve visit-status honesty. Do not invent first-person recommendations from search results.

`src/data/guide-config.ts` now owns the guide title, creator, city, signature, invite copy and existing bookmark storage key. This is a first extraction, **not** a fully city-independent template. For the next guide:

1. Copy the repository to a new guide project. Give it a unique guide ID, storage key and private server namespace. Replace the server's `guideId` and namespace defaults together with the frontend configuration.
2. Replace editorial content through the existing CSV workflow (`docs/content/places.csv`, `npm run places:check`) and the JSON records for walks, neighborhoods and multiple branches. Follow the README and `CONTENT_AND_DATA.md`; retain provenance, photo licenses and explicit not-visited notes.
3. Replace `src/data/locations.json`, camera targets, neighborhood labels, walk guides, photos and geographic bounds. Verify the new city's actual locations and routes.
4. Replace the NYC-specific camera/label behavior in `CityMap.tsx` and `map-style.ts`. The Greenpoint extrusion data, ferries and Find Eda scenery are NYC-specific. Disable or replace them with appropriately sourced local assets; do not simply move NYC buildings to another city. Retain map attribution.
5. Update local copy, visitor notes, deep-link metadata, share text, domain, tests and README. Check all Save and Saved paths with a fresh storage namespace.
6. Reuse the interface, category controls, map/list behavior, place cards, saved collection and invitation flow. Customize colors deliberately within the existing token system.

After those three guides, identify what repeated work should become a typed guide bundle (identity + taxonomy + content + cameras + optional scenery). Build an editor only once the content import/verification workflow is understood. Each creator should ultimately control their own guide and requests; this pilot is not multi-tenant and offers no creator accounts.

## Local development and QA

`npm run dev` now serves the real `/api/creator-interest`, `/api/creator-admin`, and `/api/guide-event` handlers through a Vite development plugin. Real server-only variables can be put in ignored `.env.local`. Deployments use the root `api/` functions, not the Vite plugin.

For isolated UI QA only, set `CREATOR_LOCAL_QA=true` in ignored `.env.local`. Vite uses an in-memory fixture and a documented dummy test key from `vite.config.ts`; requests disappear when the dev server restarts. It refuses this mode if `VERCEL` is set. No deployed API imports the fixture, and no browser bundle receives server environment variables. Never describe fixture testing as production persistence verification.

### Verified in this change

- TypeScript + Vite production build passes.
- 37 tests pass, including seven creator tests: input/URL/consent validation; no success when unconfigured; signup/dedup/inbox/status/deletion flow; aggregate event allowlist and DNT; origin/size/honeypot/rate-limit controls; storage failure; CSV safety; Redis command construction and preview isolation.
- Browser desktop QA with the explicit in-memory fixture: invitation renders; valid form submits and shows success; close and Escape work; Escape restores focus to the trigger; previously saved High Line and Radio Bakery remain present across navigation.
- Screenshot: `docs/qa/creator-invitation.jpg`. The blurred map fallback reflects this QA browser's existing lack of WebGL2, not a changed map renderer.

### Not yet verified

- Real Upstash persistence and Lua execution against the provisioned database. API flow tests use an injected memory store; one transport test inspects Redis command construction. They do not prove hosted persistence.
- Hosted Vercel API routing/environment setup and authenticated inbox browser flows.
- Phone-size browser QA: the available browser blocked DevTools/device emulation. Responsive styles were added, but this is not a substitute for a phone check.
- 3D map rendering remains unavailable in this QA browser. No map renderer, camera or pins changed here.

Keep this PR a draft until storage activation and the hosted smoke test are complete. No production merge or deployment is performed as part of the implementation.

## References

- https://upstash.com/docs/redis/features/restapi — command bodies, errors, atomicity (checked 2026-11-15).
- https://vercel.com/docs/functions — project-root API functions.
- https://vercel.com/marketplace — connection and plan selection.
