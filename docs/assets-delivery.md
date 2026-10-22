# Assets and delivery review — 22 October 2026

The application uses Next.js 16.4.2 standalone output (`dist`), React 19.3.1, Node 22, npm, Apache HTTPS reverse proxy, and Cloudflare. Public pages are prerendered where possible. The self-hosted Cormorant Garamond, Inter, and Roboto files retain Latin, Latvian extended Latin, and Cyrillic coverage; no font, image, or language has been removed.

## Findings and changes

- The homepage hero previously placed both its visible LCP image and a hidden full-screen upcoming image in the initial HTML as eager requests. It now server-renders one image, waits for its load event plus 1.5 seconds before preparing the next, and keeps the current image visible until the next has loaded. Reduced-motion users get a still image. Hidden tabs stop rotation and upcoming-slide rendering. All original photographs, framing, and crossfades remain available.
- Hero quality is explicitly 75, matching the existing Next image allowlist (`dist/images-manifest.json`). The previous 80/70 props were normalized to 75 by Next, so they never delivered the image savings their comments claimed. This change does not lower the actual configured quality.
- The previous `scripts/analyze.js` measured the entire server/build/cache/standalone tree as a browser bundle and could crash when its percentage bar exceeded 100%. It is replaced with an initial-route payload report derived from actual `<script src>` and stylesheet tags in production HTML. It includes shared framework scripts once per route and excludes server code and copies. `--check` enforces versioned gzip byte budgets; `--output` saves a machine-readable report.
- No new dependencies, speculative font removal, immutable caching of mutable public URLs, or new cache layer was introduced.

## Reproducible build payload baseline

The existing production build was inspected before source changes. Sizes below use Node `zlib.gzipSync` defaults, not measured browser transfer. Actual Brotli/Gzip, HTTP overhead, cache state, images/fonts, runtime imports, and prefetches require separate browser measurements. KiB means 1024 bytes.

| Route | Initial JS raw bytes | Initial JS gzip bytes | Script tags | CSS gzip bytes |
| --- | ---: | ---: | ---: | ---: |
| `/lv/`, `/en/`, `/ru/` | 971906 | 290020 | 17 | 18045 |
| `/lv/projekti/` | 1058951 | 312898 | 18 | 18045 |
| `/lv/projekti/dekton-virtuves-sala/` | 1058951 | 312898 | 18 | 18045 |
| `/lv/store/` | 1102798 | 332940 | 21 | 18045 |

All 125 prerendered route documents were measured. Dynamic account/admin routes have no prerendered HTML and must be measured in an authenticated browser; this checker explicitly reports that limitation. It does not claim to measure Core Web Vitals or total page weight.

```bash
npm run build
node scripts/analyze.js --check --output=test-results/route-payloads.json
node scripts/analyze.js --all
npx vitest run src/__tests__/unit/hero-image-delivery.test.tsx
```

`performance-budgets.json` starts with approximately 10% headroom over the measured baseline for homepage, projects, store, and shared CSS. These are deterministic initial-asset budgets. Tighten them after integrated before/after measurements; do not increase them simply to hide a regression. A missing build or missing referenced asset fails the command.

## Caching and deployment boundaries

Next's content-hashed `/_next/static/` assets are safe to cache immutably. Public `/fonts/` and `/images/` use stable, mutable URLs; do not give them year-long immutable headers without adding content fingerprints. Next optimized images vary by source URL, width, quality, and output format. The existing 60-second image minimum TTL remains unchanged because CMS source URLs may be mutable and cache invalidation has not been established.

Observed live Cloudflare responses: public HTML `CF-Cache-Status: DYNAMIC`; fonts had `public, max-age=14400`. This is observed delivery behavior, not a guarantee of future CDN cache state. Do not publicly cache account/admin/API/auth responses or rely on CDN defaults to protect private data.

The checked-in Apache no-store location pattern covers `/api`, `/admin`, `/studio`, and `/auth`, but must also cover localized account routes. The lead/account-security workstream owns that shared configuration correction and its integrated verification.

The atomic release helper verifies archive checksums, rejects links and environment files, installs root-owned application files with an unprivileged runtime account, and rolls back a release whose health check fails. No production service or Apache change is made by this assets workstream. Use the project's reviewed release procedure, retain the previous release, check local and public health plus representative journeys after release, and switch back through the existing rollback procedure if necessary.

## Verification and remaining limits

The focused hero tests cover delayed secondary fetching, unloaded-slide protection, reduced motion, and hidden-tab pause. Targeted ESLint passes. The build checker successfully measured all 125 existing prerendered routes. Integrated production build, route payload changes, and desktop/mobile lab comparisons are the lead/independent-verification workstreams' responsibility.

No asset has been deleted. Original images can be referenced through CMS/public URLs even without a direct source import; import analysis alone is insufficient evidence to remove them. Source-image recompression and changing fonts were deferred because existing images already use responsive Next optimization and all three typeface roles belong to the brand.

## Primary references

- [Next Image component](https://nextjs.org/docs/app/api-reference/components/image): responsive sizes, preload/loading, qualities allowlist, and image caching.
- [Next.js self-hosting](https://nextjs.org/docs/app/guides/self-hosting): reverse proxy and cache handling.
- [MDN HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching): private responses, immutable URLs, and freshness.
