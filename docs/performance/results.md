# Before/after laboratory results

Three samples per cell, median [minimum–maximum]. Same simulated profiles and anonymous production-origin conditions; details/caveats in [README](README.md). Times are milliseconds; transfer weight includes response overhead. These are not field percentiles.

## mobile — cold browser cache

| Route | LCP before → after (ms) | Transfer before → after (KiB) | Requests before → after | CLS before → after |
| --- | --- | --- | --- | --- |
| /lv/ | 2648 [2580–2648] → 1268 [1172–1312] | 761.4 [761.4–761.4] → 612.5 [612.5–612.5] | 51 [51–51] → 49 [49–49] | 0.0026 [0.0026–0.0026] → 0.0012 [0.0012–0.0012] |
| /lv/akmens-virsmas/ | 1244 [1240–1300] → 1052 [980–1060] | 700.0 [700.0–700.0] → 568.9 [568.9–573.3] | 48 [48–48] → 47 [47–48] | 0.0023 [0.0023–0.0023] → 0.0000 [0.0000–0.0000] |
| /lv/projekti/ | 2612 [2588–2652] → 1540 [1516–1728] | 744.0 [744.0–744.0] → 612.6 [612.6–612.6] | 52 [52–52] → 51 [51–51] | 0.0000 [0.0000–0.0000] → 0.0001 [0.0001–0.0001] |
| /lv/store/ | 3588 [3552–3744] → 3272 [3224–3272] | 664.5 [664.4–664.5] → 532.7 [532.7–532.7] | 49 [49–49] → 46 [46–46] | 0.0000 [0.0000–0.0068] → 0.0000 [0.0000–0.0000] |
| /lv/akmens-virsmas/silestone/ | 3284 [3256–3312] → 1980 [1944–2016] | 684.3 [684.3–684.3] → 553.2 [553.2–553.2] | 47 [47–47] → 46 [46–46] | 0.0000 [0.0000–0.0000] → 0.0000 [0.0000–0.0000] |
## desktop — cold browser cache

| Route | LCP before → after (ms) | Transfer before → after (KiB) | Requests before → after | CLS before → after |
| --- | --- | --- | --- | --- |
| /lv/ | 500 [496–524] → 332 [324–384] | 860.5 [860.5–860.6] → 673.8 [673.8–673.8] | 54 [54–54] → 53 [53–53] | 0.0021 [0.0021–0.0230] → 0.0027 [0.0025–0.0027] |
| /lv/akmens-virsmas/ | 468 [216–500] → 268 [268–284] | 744.2 [744.2–744.2] → 633.2 [633.2–633.2] | 55 [55–55] → 55 [55–55] | 0.0021 [0.0021–0.0025] → 0.0021 [0.0021–0.0021] |
| /lv/projekti/ | 228 [196–748] → 312 [312–316] | 819.3 [819.3–819.3] → 707.9 [707.3–710.0] | 68 [68–68] → 68 [68–68] | 0.0021 [0.0021–0.0021] → 0.0021 [0.0021–0.0021] |
| /lv/store/ | 648 [604–680] → 520 [516–528] | 673.1 [673.1–673.1] → 568.9 [568.9–573.3] | 51 [51–51] → 51 [51–52] | 0.0172 [0.0050–0.0172] → 0.0044 [0.0044–0.0044] |
| /lv/akmens-virsmas/silestone/ | 872 [796–1636] → 652 [628–672] | 880.8 [880.8–880.8] → 769.8 [769.8–769.8] | 58 [58–58] → 58 [58–58] | 0.0021 [0.0021–0.0062] → 0.0060 [0.0060–0.0060] |

Full warm/cold timings, TTFB, main-thread long tasks, payload types and API samples are in [comparison.json](comparison.json). Interaction event→paint proxies are not INP; store/search terminal500 timings are not successful catalog results.

### desktop interactions

| Metric | Before median [range] | After median [range] |
| --- | --- | --- |
| loginTogglePaintProxyMs | 42.1 [41.8–51.9] | 43.1 [37.5–50.9] |
| navigationReadyMs | 205.2 [180.9–280.1] | 235.4 [168.5–242.3] |
| typingPaintProxyMs | 30.4 [23.3–35.4] | 31.7 [25.1–32.9] |
| searchTerminalResponseMs | 422.6 [402.5–462.0] | 443.1 [427.5–491.4] |
| initialCatalogueRequests | 3.0 [3.0–3.0] | 1.0 [1.0–1.0] |
| documents | 1.0 [1.0–1.0] | 1.0 [1.0–1.0] |

### mobile interactions

| Metric | Before median [range] | After median [range] |
| --- | --- | --- |
| loginTogglePaintProxyMs | 99.8 [84.7–122.1] | 84.7 [66.7–89.4] |
| navigationReadyMs | 624.0 [608.7–734.1] | 651.3 [569.9–761.2] |
| typingPaintProxyMs | 42.0 [30.5–43.8] | 35.5 [26.8–36.6] |
| searchTerminalResponseMs | 596.9 [530.3–627.0] | 583.2 [564.6–598.6] |
| initialCatalogueRequests | 3.0 [3.0–3.0] | 1.0 [1.0–1.0] |
| documents | 1.0 [1.0–1.0] | 1.0 [1.0–1.0] |
