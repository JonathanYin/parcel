<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Parcel Project Guide

## Product

Parcel is a shopping and package-delivery simulator. Users browse products, manage a cart, complete checkout without a real payment, view an order confirmation, and progress packages through a tracking timeline.

Keep the shopping experience immersive. Normal shopping labels should read naturally, such as "Buy now", "Checkout", and "Place order". Do not add repetitive "fake", "pretend", or "imaginary" language throughout the interface. The checkout payment method and footer provide the required simulation disclosures.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript with strict mode
- Tailwind CSS 4
- Local mock data and browser `localStorage`
- No backend, payment processor, carrier API, or email service

## Commands

```bash
npm run dev
npm run lint
npm run build
npm run test:e2e
```

Before considering a change complete, run:

```bash
git diff --check
npm run lint
npm run build
npm run test:e2e
```

## Architecture

- `app/`: thin App Router route files.
- `components/`: client-side UI and shopping-flow components.
- `components/store-provider.tsx`: source of truth for cart, orders, tracking progress, notifications, and recently viewed products.
- `components/notification-center.tsx`: persisted in-app order and delivery updates.
- `lib/types.ts`: shared domain models.
- `lib/products.ts`: mock catalog and product helpers.
- `lib/pricing.ts`: subtotal, shipping, tax, and total calculations.
- `tests/e2e/`: Playwright coverage for the critical shopping journey.
- `DESIGN.md`: Pinterest-inspired visual-system reference.

Prefer keeping route files thin and putting interactive behavior in reusable components.

## Persistence

The store persists these keys:

- `parcel-cart`
- `parcel-orders`
- `parcel-recent`
- `parcel-notifications`

Storage access must remain guarded because `localStorage` can be unavailable or malformed. Do not allow actions before hydration if they could be overwritten by stored state.

Orders and tracking are simulations stored entirely in the current browser. Order creation must snapshot cart items, clear the cart, and generate unique order and tracking IDs.

## Design Direction

Use `DESIGN.md` before changing UI. The current direction is:

- White and warm-cream canvas
- Quiet chrome and minimal shadows
- Pinterest-inspired masonry product discovery
- Rounded search fields, chips, cards, and buttons
- Saturated red for primary discovery actions
- Local generated product photography; no external image dependency

Preserve responsive behavior and avoid introducing decorative complexity that competes with product discovery.

## Product Rules

- Keep at least 64 products across the eight existing categories.
- Search should match product names, categories, and descriptions.
- Cart, orders, tracking progress, and recently viewed items must survive refreshes.
- Checkout must not collect or process real payment details.
- The confirmation screen shows an email preview but sends no email.
- Tracking progresses locally through the five existing statuses.
- Tracking automatically advances every 30 seconds and can also be advanced manually.
- Order and tracking updates should create deduplicated in-app notifications.

## Engineering Notes

- Avoid calculating current dates during static rendering when the result can become stale or cause hydration differences.
- Guard checkout against duplicate submissions.
- Keep order and tracking identifiers collision-resistant.
- Preserve unknown or unrelated user changes in the worktree.
- Add abstractions only when they reduce meaningful duplication or clarify a shared behavior.

## Testing

Playwright covers search, category browsing, cart persistence, quantity changes, checkout, confirmation email preview, tracking progression, and automatic tracking notifications. Extend the suite whenever changing these flows.
