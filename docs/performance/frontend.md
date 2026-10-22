# Frontend runtime workstream

Inspected the public storefront, product/detail views, project filtering and editing, navigation, stock hook, route structure, and existing tests before editing. Changes below are limited to the public store client components and project editor loading. Authentication, database/API changes, framework configuration, dependencies, and assets remain with other workstreams.

## Findings and implemented changes

| Reference | Observed problem | Change and evidence |
| --- | --- | --- |
| `src/components/store/ProductFilters.tsx` | A mount-time 300 ms debounce always published a new filter object; pending searches captured old checkbox selections. Visible controls did not follow external URL changes. | Only input events start debounce; completion reads latest filters. Draft inputs reset on external source changes, including A → B → A history. Focus rings, input names, mobile expanded state, keyboard price application, and localized labels added. |
| `src/components/store/ProductGrid.tsx` | Equivalent object instances triggered repeated requests; old search responses could replace newer results; page increment happened before success inside a state updater. | Stable query key, abortable requests and generation checks. Loaded page advances only after success; retry preserves page. Existing results remain visible during refresh/failure, with status and retry controls. Keyboard users can load more without intersection scrolling. |
| `src/app/[locale]/store/StoreContent.tsx` | Filter and sort changes were absent from URL/history; `initialFilters` could suppress history restoration. | Immediate client state plus Next-compatible native history updates preserve filter/sort deep links, unrelated query parameters and hash. Back/forward restores filters and sort without refetching the server shell. |
| `src/app/[locale]/projects/ProjectsPageClient.tsx` | The admin editor was eagerly imported and mounted with a null project. Its one-time form initialization therefore retained empty or previously edited fields. | Dynamic editor import, rendered only for an authorized admin with an open selected project. UUID key and conditional mount give every edit a fresh form. Filter buttons expose `aria-pressed`. Server authorization is unchanged. |

Expected impact: fewer duplicate catalog requests, less blank content during filtering, deterministic results under slow/out-of-order responses, recoverable pagination, and deferred public download/evaluation of the administrative project editor. These are not claims of measured LCP or interaction improvement; use the integrated production benchmark for those results.

## Verification

Commands from repository root:

```sh
npx vitest run src/__tests__/unit/store-runtime.test.tsx src/__tests__/unit/project-editor-loading.test.tsx
npx tsc --noEmit
npx eslint 'src/app/[locale]/store/StoreContent.tsx' src/components/store/ProductFilters.tsx src/components/store/ProductGrid.tsx 'src/app/[locale]/projects/ProjectsPageClient.tsx' src/__tests__/unit/store-runtime.test.tsx src/__tests__/unit/project-editor-loading.test.tsx --no-warn-ignored
git diff --check
```

Results: **10 tests passed**, TypeScript passed, owned-file whitespace check passed. Targeted lint: **0 errors / 1 warning**, concerning the existing pattern of starting an external product fetch from an effect that sets loading state.

Regression cases cover: a single initial catalog fetch after 500 ms, immediate input feedback with a 300 ms request debounce, intervening checkbox preservation, visible history control restoration, clear-filter cancellation, late responses despite ignored aborts, unchanged semantic filter objects, preserving useful results during refresh, same-page pagination retry, anonymous editor deferral, and actual editor fields initialized/reset between selected projects.

Tests use controlled product responses and project fixtures. They do not establish live commerce operation, authenticated admin authorization, real-user INP, or screen-reader/browser behavior. The lead's production build and independent desktop/mobile browser verification remain required.

## Remaining findings

- `src/hooks/useProductStock.ts` refetches stock separately on every card mount even though catalog responses include stock, and subscribes per product. Batch/snapshot work requires careful real-time freshness and checkout correctness validation; untouched here.
- `ProductSort` custom dropdown lacks comprehensive keyboard/listbox semantics; `ProductCard` nests action buttons inside its navigation link. Both need follow-up accessibility work.
- Project summaries/location remain hover-dependent on some cards, limiting touch discovery.
- Production catalog-table availability and real catalog scale are external limits on representative search/detail measurement. No fabricated stock/products were added to production.
- Native-history integration is unit-tested via search-parameter updates; actual browser back/forward and scroll preservation need the independent production browser pass.

No dependencies, assets, account features, tables, or migration history were removed in this workstream.
