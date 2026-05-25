# Minimal repro: same-pathname different-query soft navigation is dropped client-side on Next 16.2.6 prod build when the RSC payload exceeds a small threshold

Clicking a `router.push("/listings?regions=75")` button on the `/listings` page does not change the URL and does not update the visible content. The Server Component DOES re-run on the server (its `console.log` fires in the terminal running `npm start`), but the client never commits the navigation. Only reproduces under `next build && next start`. `next dev` works (just slower while the chunky payload streams). Hard navigation via the URL bar works fine.

This is **not** the repeated-key duplicate case targeted by PR #93368. It is `(no regions param) -> regions=75`: a single key, a single value, absent-to-present, on the same pathname.

## The trigger is payload size

This is the missing variable in earlier minimal repros: a trivial response navigates correctly, a non-trivial one breaks. The threshold is small and the failure rate scales with payload size.

| Payload | Symptom |
|---|---|
| `count=0` (no rows) | works |
| `count=200` (small) | intermittent: typically needs 5-20+ clicks before a navigation is dropped |
| `count=5000` (default for the `regions=75` button) | deterministic on every click |
| `count=20000` (huge) | deterministic on every click |

## Reproduce

```bash
npm install
npm run build
npm start
```

1. Open `http://localhost:3000/listings`. Note the `server-rendered-at` timestamp and the `[server] /listings rendered` log line in the terminal running `npm start`.
2. Click **regions=75 (5000 rows default)**.
3. **Expected:** URL becomes `/listings?regions=75`, page re-renders, table shows 5000 rows, `server-rendered-at` updates, terminal logs a fresh `[server] /listings rendered { regions: '75', count: 5000, ... }`.
4. **Actual on prod build (`next build && next start`):** URL stays at `/listings`. Page content does not update. The server-side `[server] /listings rendered` log line DOES fire in the terminal (the Server Component re-ran with the new `regions` value), but the client never commits the navigation, so the URL bar and the rendered DOM stay frozen on the previous state.

Click **count=200** to confirm the same bug fires intermittently on a smaller payload. The failure rate scales with payload size; at `count=20000` it fails on every click without exception.

## Hard navigation works

Loading `http://localhost:3000/listings?regions=75` directly in the URL bar renders correctly with all 5000 rows. Same for `window.location.assign("/listings?regions=75")` from the page. The bug is specific to client-side soft navigation on the same pathname.

## What this repro includes

- `app/listings/page.tsx`: async Server Component, awaits a 10ms timer, generates N fake rows from `?count=N` (default 5000 when `regions` is set), renders them in a `<table>`.
- `app/listings/loading.tsx`: minimal loading boundary. Present in the real app where the bug was first observed.
- `app/listings/FilterButton.tsx`: five `router.push` buttons covering small / default / huge / no-params variations.

No Prisma, no NextAuth, no Tailwind, no fonts, no middleware. Stock `create-next-app` shell with three files added on top.

## Environment

- Next 16.2.6 (`16.2.5` also affected on the real app)
- React 19.2.4
- Node 24
- `next build && next start` (Turbopack). `next dev` works.

## Workarounds tested against the real app

| Approach | URL updates? | Server data updates? |
|---|---|---|
| `router.push(target)` | no | no |
| `router.replace(target)` | no | no |
| `<Link href={target}>` from same page | no | no |
| `history.pushState + router.refresh()` | yes | no (stale) |
| `router.push('/other')` + 50ms delay + `router.push(target)` | yes | yes (but flashes intermediate page) |
| `window.location.assign(target)` (hard navigation) | yes | yes (~300ms) |

`window.location.assign` is the only workaround that fully recovers correct behavior.
