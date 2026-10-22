# Mobile CPU regression investigation

The initial before/after benchmark showed lower LCP and page weight but greater observed long-task excess on the material guide, projects, and Silestone pages. This investigation used Silestone as a representative shared-layout page and directly tested whether the capture window or changed application work caused the regression.

## Conditions and evidence

Three paired runs alternated execution order against the immutable baseline server (`127.0.0.1:3100`, release `d04bc9abc3b2102dffe20a64ec0441930204a3bb`, recorded source `d511142`) and candidate server (`127.0.0.1:3200`, source `160f77c`). Chromium `145.0.7632.6`, viewport 390×844, touch/mobile, reduced motion, 4× CPU throttling, 80 ms configured latency, 200,000 B/s download, 93,750 B/s upload. Each run used a fresh browser context and cold HTTP cache; server caches were warm. CPU profiling and DevTools tracing were enabled equally. Their overhead means these numbers are diagnostic and must not replace the unprofiled before/after benchmark.

Both the original load-event + 1,500 ms window and a fixed 8,000 ms navigation window were recorded. **Long-task totals were identical between the windows in every run. The regression was not an unequal-capture-window artifact.**

Values below are medians [minimum–maximum], three runs per cell, in milliseconds:

| Diagnostic metric | Before | Candidate before language guard |
| --- | ---: | ---: |
| LCP | 3268 [3240–3296] | 2016 [1960–2172] |
| Main-thread task duration | 2531.2 [2441.2–2561.4] | 2462.6 [2367.0–2686.5] |
| Script duration | 732.8 [716.2–762.1] | 638.7 [597.3–653.6] |
| Layout duration | 347.0 [291.3–364.6] | 393.9 [368.6–457.6] |
| Style recalculation duration | 144.9 [140.0–151.0] | 247.3 [215.1–284.8] |
| Observed long-task excess | 583 [515–591] | 715 [684–832] |

The candidate reduced total main-thread and JavaScript work while increasing layout/style work and concentrating more work into long tasks. Long-task excess is a thresholded sum and can increase while total work decreases. This metric is neither field INP nor Lighthouse TBT.

## Attribution

1. The candidate's first full layout covered approximately 591 layout objects in one 206–284 ms event. A representative baseline first laid out 321 objects in 99 ms, followed by a later partial content layout of 288 dirty objects in 62 ms. This is a changed work distribution, not proof that the candidate executes more application JavaScript.
2. Font subset completion was more staggered. Candidate font arrivals at approximately 1.17, 1.45, 1.63, 2.07, and 2.21 seconds each invalidated a document-wide text layout. Baseline font arrivals grouped around 2.44, 3.11, and 3.30 seconds. The smaller, earlier fonts improve LCP and transfer weight; no speculative font-display or branding change was made to hide their layout work.
3. `LocaleDocumentLanguage` assigned `document.documentElement.lang = 'lv'` even when server markup already declared `lv`. Setter instrumentation recorded **lv → lv** at 3.06–3.14 seconds in all three candidate experiment runs. Each assignment caused an avoidable full-document style recalculation affecting **717 elements**, about 86–110 ms under these conditions.
4. Largest sampled JavaScript frames remained Turbopack module initialization (`W`) and React DOM rendering frames (including `ax`) in the common runtime bundles. Measured overall script work decreased. The evidence does not point to new expensive public application calculations.

## Controlled language experiment and fix

Three additional paired runs used the same candidate build. One side ran unchanged; the other intercepted only the root-language setter, recording but suppressing the observed redundant lv → lv assignment. Both sides still ended with the same correct document language. This was browser-only diagnostic instrumentation, never production behavior.

| Diagnostic metric | Unchanged candidate | Redundant assignment suppressed |
| --- | ---: | ---: |
| LCP | 1984 [1972–2464] | 1992 [1972–2020] |
| Main-thread task duration | 2532.5 [2387.9–2546.4] | 2356.5 [2239.4–2357.4] |
| Style recalculation duration | 238.6 [209.4–262.8] | 139.2 [127.0–160.7] |
| Observed long-task excess | 794 [654–811] | 653 [627–673] |

The late 717-element style recalculation disappeared when the assignment was suppressed. The implementation now compares the current document language with the requested language before assigning it. English/Russian locale navigation continues to update the language. Existing two locale tests were retained and two regression tests added: **4/4 pass**, targeted lint clean. The lead rebuilt source `e0c30a3` and repeated all ordinary unprofiled measurements; see `results.md`. Silestone final observed long-task excess median564ms [533–624] versus baseline540ms [492–570], down from the earlier unprofiled candidate763ms [629–781]. Some guide/project long-task excess remains higher. Diagnostic tracing is not substituted for final release measurements.

## Reproduction

Start the two production builds on the documented ports, then:

```sh
CPU_OUTPUT=/tmp/lago-cpu-before-after node scripts/performance-cpu-profile.mjs

CPU_OUTPUT=/tmp/lago-cpu-language \
CPU_ENDPOINTS='[{"name":"candidate","base":"http://127.0.0.1:3200"},{"name":"diagnostic-ignore-lang","base":"http://127.0.0.1:3200","skipLanguageMutation":true}]' \
node scripts/performance-cpu-profile.mjs

npx vitest run src/__tests__/unit/locale-document-language.test.tsx
```

`CPU_RUNS` defaults to 3 and `CPU_ROUTE` defaults to `/lv/akmens-virsmas/silestone/`. Browser profiler/tracing output defaults outside the repository (`/tmp/lago-cpu-profile`). After the guard is included in the candidate build, the diagnostic interception should have no assignment to suppress on Latvian pages.

Versioned evidence: `cpu-attribution.json` (paired medians/ranges), `cpu-investigation/summary.json` and `cpu-language-experiment/summary.json` (individual observations), and `cpu-trace-excerpt.json` (compact relevant rendering/font events). Full compressed profiles/traces are retained locally outside Git at `/tmp/lago-cpu-artifacts-20261022`; they are deliberately excluded from repository history.
