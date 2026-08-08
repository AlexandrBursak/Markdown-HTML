# Skill: Frontend Application Architecture

## Context

This repository IS the frontend; source lives under `src/`. It uses Next.js App Router with TypeScript.

This skill adapts the CRUX React architecture guide to the project's Next.js application. The goal is a predictable frontend structure where route composition, domain data, reusable UI, forms and widgets have clear ownership.

Use this together with `frontend-nextjs.md`.

## Source Root

All frontend source code belongs under `src/`.

Recommended structure:

```text
src/
  app/                  # Next.js route layer
  data/                 # API access, DTOs, mappers, data hooks
  entities/             # domain types, enums and constants
  providers/            # application provider composition
  shared/               # reusable UI, hooks, lib, utilities, assets, styles
  view/                 # application UI blocks
    components/         # feature-level reusable UI components
    forms/              # form modules
    widgets/            # composed feature blocks
```

## Core Principles

- Use Server Components by default.
- Use Client Components only for browser APIs, event handlers, local interactive state, forms or client-side data hooks.
- Keep route files in `app/` thin. Routes compose data, metadata, layouts, widgets and forms.
- Keep API calls, DTOs and mappers in `data/`.
- Keep business/domain models in `entities/`.
- Keep reusable design-system-like primitives in `shared/`.
- Keep product-specific UI blocks in `view/`.
- Do not put business logic in React components.
- Do not put API calls directly in UI components.
- Prefer clarity over rigid structure when a small exception makes the code easier to understand.

## Layer Dependency Rules

Imports must flow from higher layers to lower layers. Lower layers must not know about higher layers.

| Layer | Can import from |
| --- | --- |
| `shared/` | no application layers |
| `entities/` | no application layers |
| `data/` | `entities/`, `shared/` |
| `providers/` | `data/`, `shared/` |
| `view/` | `data/`, `entities/`, `shared/` |
| `app/` | all layers |

Rules:

- `shared/` must not import from `entities/`, `data/`, `view/`, `providers/` or `app/`.
- `entities/` must not import React, Next.js, API clients or UI modules.
- `data/` must not import from `view/`, `providers/` or `app/`.
- `view/` must not import from `app/`.
- `providers/` must not import from `view/` or `app/`.
- If a component needs a domain type, it belongs in `view/components/`, not `shared/ui/`.

## `app/` Route Layer

`app/` is the Next.js route layer and replaces the generic React `pages/` layer from the CRUX guide.

Allowed responsibilities:

- define route segments, layouts, pages, loading states and error boundaries
- define `metadata` and `generateMetadata`
- perform route-level server data loading
- compose widgets, forms and feature components
- enforce route-level access decisions by calling server-safe auth/session helpers

Avoid:

- reusable business UI in route files
- DTO mapping logic in route files
- direct client-side API calls
- long component trees inside `page.tsx`

Route-private components are allowed only when they are truly used by one route. Place reusable pieces in `view/`.

Example:

```text
app/
  (shop)/
    products/
      page.tsx
      loading.tsx
    products/[slug]/
      page.tsx
      generateMetadata.ts
  admin/
    products/
      page.tsx
      loading.tsx
```

## `entities/` Layer

`entities/` defines the project domain models used throughout the frontend.

Use it for:

- domain types: `Product`, `Category`, `Cart`, `Order`, `Customer`, `User`
- enums and unions: `UserRole`, `PaymentMethod`, `DeliveryMethod`, `OrderStatus`
- domain constants that do not depend on APIs or UI

Do not use it for:

- API DTOs
- React components
- hooks
- validators tied to a specific form
- HTTP clients

Recommended structure:

```text
entities/
  product/
    types.ts
    constants.ts
    index.ts
  order/
    types.ts
    constants.ts
    index.ts
  auth/
    types.ts
    constants.ts
    index.ts
```

## `data/` Layer

`data/` owns data access and transformation.

Use it for:

- API functions
- server-safe data functions
- DTO types
- mappers from DTOs to entities
- client data hooks when client-side fetching or mutations are required
- cache key builders
- API error normalization

Group by domain entity or feature. For the project, prefer entity/feature grouping because catalog, checkout, admin and account flows will grow.

```text
data/
  product/
    productAPI.ts
    productDTO.ts
    productMapper.ts
    hooks.ts
    keys.ts
    index.ts
  cart/
    cartAPI.ts
    cartDTO.ts
    cartMapper.ts
    hooks.ts
    index.ts
  pagination/
    paginationDTO.ts
    paginationMapper.ts
    types.ts
```

Rules:

- API functions return DTOs or mapped entities deliberately. Do not mix both styles in one module.
- Mappers isolate backend response shape from frontend domain shape.
- **`apiRequest` unwraps `body.data`** — the backend MUST return `{ data: ... }`
  (see `contract.md`). A missing envelope yields `undefined` client-side.
- Keep server-only code out of client modules. Client components import server
  actions from the specific action module, never a barrel that re-exports
  `server-only` code (see `onboarding.md` §2 / `contract.md`).
- Do not expose backend secrets through `NEXT_PUBLIC_*`.
- Prefer server-side data loading for SEO-sensitive public pages.
- Use client data hooks only for interactive flows that need browser-side updates.
- Test critical mappers and error normalization.

Suggested data flow:

```text
API DTO -> mapper -> entity/view model -> view/widget/page
```

## `providers/` Layer

`providers/` composes application-wide React providers.

Use it for:

- client query provider if the project adopts a client query library
- auth/session context when a client context is needed
- theme provider
- notification provider
- future i18n provider

In Next.js App Router, provider composition is usually rendered from `app/layout.tsx`.

Recommended structure:

```text
providers/
  AppProviders.tsx
  QueryProvider.tsx
  ThemeProvider.tsx
  AuthProvider.tsx
  index.ts
```

Rules:

- Provider files that use React context or browser state must be Client Components.
- Keep provider initialization centralized in `AppProviders`.
- Do not place page-specific state in global providers.

## `view/` Layer

`view/` contains application UI blocks.

### `view/components/`

Use for feature-level reusable components.

Examples:

```text
view/components/
  ProductCard.tsx
  ProductPrice.tsx
  CategoryBreadcrumbs.tsx
  OrderStatusBadge.tsx
```

Rules:

- Components render UI and simple UI behavior.
- Components may accept entities as props.
- Components do not call APIs.
- Components do not own business workflows.

### `view/forms/`

Use for forms with validation, form state and submit orchestration.

Recommended form module:

```text
view/forms/CheckoutContactForm/
  Component.tsx
  form.ts
  submit.ts
  constants.ts
  index.ts
```

Responsibilities:

- `form.ts`: schema, types, default values, value mappers
- `Component.tsx`: UI and form library integration
- `submit.ts`: submit hook/function that calls `data/` mutations or server actions
- `constants.ts`: form IDs and UI constants
- `index.ts`: public exports

Rules:

- Use factory functions for default form values.
- Keep API validation error mapping close to submit logic.
- Do not import API clients directly in `Component.tsx`.
- Put reusable form fields in `shared/ui/` only when they are domain-neutral.

### `view/widgets/`

Use for composed feature blocks that pages can place directly.

Examples:

```text
view/widgets/
  ProductGridWidget/
    ProductGridWidget.tsx
    index.ts
  CartSummaryWidget/
    CartSummaryWidget.tsx
    index.ts
  AdminProductTableWidget/
    AdminProductTableWidget.tsx
    index.ts
```

Rules:

- Widgets may compose components, forms and shared UI.
- Widgets may call data hooks or receive data from routes.
- Widgets expose a small prop API.
- Widgets should hide internal composition from routes.

## `shared/` Layer

`shared/` contains reusable infrastructure and primitives that are not tied to the project business entities.

Recommended structure:

```text
shared/
  ui/
  hooks/
  lib/
  utils/
  assets/
  styles/
  constants/
```

Use it for:

- generic UI primitives: `Button`, `Input`, `Modal`, `Tabs`, `Select`
- generic hooks: `useToggle`, `useDebounce`
- HTTP client setup and low-level helpers
- formatting utilities
- global styles and design tokens
- reusable assets

Rules:

- No domain imports.
- No product, order, cart, payment or delivery logic.
- Generic utilities must stay reusable outside the project.
- If a component imports `Product`, `Order` or `UserRole`, move it to `view/`.

## Naming Rules

Use standard React naming conventions adapted from the CRUX guide.

| Type | Convention | Example |
| --- | --- | --- |
| Layer folders | lowercase | `data/`, `shared/`, `view/` |
| Entity/feature folders | lowercase | `product/`, `checkout/`, `nova-poshta/` |
| Component/form/widget folders | PascalCase | `ProductGridWidget/`, `CheckoutForm/` |
| React component files | PascalCase | `ProductCard.tsx`, `Button.tsx` |
| Hook files | camelCase with `use` prefix | `useToggle.ts`, `useCartMutation.ts` |
| API files | camelCase, uppercase acronym allowed | `productAPI.ts`, `novaPoshtaAPI.ts` |
| DTO files | camelCase, uppercase acronym allowed | `productDTO.ts`, `orderDTO.ts` |
| Mapper files | camelCase | `productMapper.ts`, `cartMapper.ts` |
| Type/config/constant files | camelCase | `types.ts`, `constants.ts`, `queryKeys.ts` |

Rules:

- Exported React component names must match their component file names.
- Keep route segment folders in `app/` aligned with URLs.
- Use the `@/*` alias for imports from `src`.
- Avoid case-only renames on macOS. Use a temporary name in between and verify with Git.

## Domain Modules

Expected the project frontend domains include:

- `product`
- `category`
- `cart`
- `checkout`
- `delivery`
- `payment`
- `auth`
- `account`
- `order`
- `admin`
- `content`
- `inventory`

Use these names consistently across `entities/`, `data/`, `view/` and route segments when the domain exists in multiple layers.

## SEO and Content Rules

- Public catalog, product detail, category and content pages must be SSR or SSG friendly.
- Use `metadata` or `generateMetadata` in route layer.
- Keep indexable content server-rendered unless there is a clear reason not to.
- Homepage, FAQ, lookbook and editorial content should be driven by backend/content data when practical, not hardcoded long term in UI components.
- Add JSON-LD where it improves search results for products, breadcrumbs or organization data.

## Testing Rules

Add focused tests when adding critical frontend logic:

- DTO mappers
- money and price formatting
- checkout calculations and form value transforms
- API error normalization
- permission or role visibility helpers

Do not test presentational components unless behavior or conditional rendering is meaningful.
