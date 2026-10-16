# Project Guidance

## User Preferences

- Wants a phone-app feel: responsive, touch-friendly, installable to the Android home screen
- Keep customer fields limited to name, mobile number, paid fees, due fees, and total fees

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Money is stored as integer minor units (bigint cents) end to end; the frontend formats via formatMoney and parses input with parseMoneyToMinorUnits.
- The '/customers' route declares validateSearch returning a concrete object type, so every Link/navigate to it must pass the full { q, sort, duesOnly } shape.
- Backend validation failures trap (Runtime.trap) because the Candid signatures return Customer/?Customer/Bool with no error variant; the frontend surfaces these as a generic save error.
- Time.now() returns Time.Time (Int); convert with Time.now().toNat() when the domain type uses Nat nanoseconds.
- Under Enhanced Migration with check-limit=1, fold the init migration into the latest pending migration file (OldActor = {}) rather than leaving two pending migrations.
- Android home-screen installability needs manifest.webmanifest plus <link rel=manifest>, theme-color, apple-touch-icon, and valid 192/512 PNG icons at the public root; no service worker is required.
- A shared parseCustomerId helper guards BigInt route-param parsing so malformed ids render a not-found state instead of throwing.
