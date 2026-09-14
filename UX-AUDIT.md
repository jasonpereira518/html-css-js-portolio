# Portfolio UX & Technical Audit

**Site:** [jasonpereira.live](https://jasonpereira.live/) · **Audited:** 2026-09-07 · **Commit:** `83b0f64` (+ uncommitted `index.html`)

**Method:** Full source read, plus live render in headless Chrome at 1440×900 (desktop) and 390×844 / 430×844 / 768×844 (mobile), with network, console, and layout instrumentation.

---

## Snapshot

| | |
|---|---|
| HTML / JS / CSS | 1,603 / 2,177 / 3,444 lines |
| Page height | ~11,300px, 8 sections |
| Project cards | 21 |
| Total page weight | **35.6 MB** across 65 requests |
| Images | 28.5 MB (80% of payload) |
| Assets on disk | 115 MB (~65 MB unreferenced) |
| Build step | None — static, Netlify |

The content is genuinely strong: AWS, Duke AI hackathon win, TEDxUNC, a 1789-backed startup. **Nearly every problem below is in delivery, not substance.**

---

## Tier 0 — Actively broken

### 1. Mobile has no navigation, and the page scrolls sideways
**Severity: critical.** At a 390px viewport, `#hamburger-nav` computes to **1136px wide** and the hamburger icon lands at **x=849** — roughly 460px off-screen. A phone visitor cannot open the menu at all. Document scroll width is 1052px against a 390px client width, so the whole page also drifts horizontally.

Two causes chain together:

- **No `border-box`.** The reset at [`style.css:5`](style.css#L5) sets `margin`/`padding: 0` but never `box-sizing`. So `width: 100%` + `padding: 4vh 5vh` on [`style.css:193`](style.css#L193) overflows by ~84px. (Same rule affects `#desktop-nav` at [`style.css:142`](style.css#L142).)
- **The "Building Now" panel isn't clipped.** [`style.css:681`](style.css#L681) parks `#right-sidecar` off-canvas via `transform`, reaching x=1396 with nothing clipping it. That inflates document scroll width, which the fixed nav's `100%` then inherits.

**Fix:** add `box-sizing: border-box` to the `*` reset; add `overflow-x: clip` on `html`/`body` (or `visibility: hidden` on the off-canvas panel until opened).

### 2. 35.6 MB page weight
28.5 MB is images. Worst offenders:

| Asset | Size |
|---|---|
| `ecocart_thumbnail.png` | 6.3 MB |
| `Object_detection.png` | 5.4 MB |
| `iphone17pro.glb` | 2.3 MB |
| `jabout-pic-modified.png` | 2.1 MB — **fetched twice** |
| `jprofile-pic-modified.png` | 2.0 MB |
| `leetstreak_logo2.png` | 1.5 MB |
| `orbit_thumbnail.png` | 1.5 MB |

Only **2 of 71** `<img>` tags carry `loading="lazy"`; **none** declare `width`/`height` (so every image causes layout shift). On a phone over cellular this is a multi-minute load.

**Fix:** convert to WebP (`cwebp` is installed), cap thumbnails at ~1600px wide, add `loading="lazy"` + `decoding="async"` + intrinsic dimensions to everything below the fold.

### 3. Two JS errors firing continuously
- **Null reference on every scroll event.** [`index.html:1475`](index.html#L1475) queries `.jason-mode-note`, but that element is not defined until [`index.html:1585`](index.html#L1585) — so it's `null` and throws on each scroll. It is also a redundant duplicate of working logic already in [`script.js:1007`](script.js#L1007). **Delete the inline block.**
- **Throw on every animation frame.** [`about-iphone-viewer.js:346`](about-iphone-viewer.js#L346) calls `controls.rotateLeft()`. OrbitControls r126 exposes no such method, so the 3D phone's settle animation throws ~60×/sec. **Use `controls.setAzimuthalAngle()` or drop the settle.**

### 4. Nine project titles are clipped
"Ethics Bowl Academ", "P2P Live…", "Sports Analytics…", "Stock News Sentiment Analysis", "Computer Vision Road Object Detection", "Receipt Expenses Tracker", "ConnectCarolina Open Seats Spotter", "FinScroll by Worthwise", "Carolina Corner Interface", "GPU Portfolio Optimization Engine" all overflow their card width.

### 5. Mobile "Experience" link is dead
[`index.html:162`](index.html#L162) points at `#Experience`; the section id is lowercase `experience`. URL fragments are case-sensitive.

### 6. A project's name is replaced by its status
[`index.html:861`](index.html#L861) renders the TarHeelEats card's `<h2>` as "Coming soon…". The thumbnail says TarHeelEats; the heading doesn't. Status belongs in a badge, not the title.

### 7. Dead links
- Three Experience cards have Github buttons pointing at bare `github.com`: [`641`](index.html#L641), [`677`](index.html#L677), [`717`](index.html#L717).
- Sidebar "← Back to Portfolio" at [`index.html:328`](index.html#L328) points to `../index.html` — outside the site root. Leftover from `jason-mode.html`.

---

## Tier 1 — Friction

### 8. The hero wastes the first viewport
~35% of the fold is empty above the photo. "Open to internships", the AWS logo, and the Duke AI win are all either below the fold or hidden inside a collapsed sidebar. A recruiter's first screen currently communicates only a name and a rotating job title.

### 9. Unmodified keypresses hijack navigation
[`script.js:1000`](script.js#L1000) navigates to Jason Mode on any `j` keypress outside an input. `/` opens the terminal — which is Firefox's quick-find key. Neither requires a modifier. **Gate behind a modifier or a Konami-style sequence.**

### 10. Too many chrome layers compete for attention
Left sidebar, right edge-peek sidecar, terminal overlay, resume modal, project hover preview, scroll progress bar, ticker, Jason-Mode toast, typewriter, 3D phone, and AOS on nearly every element. Individually clever; collectively they pull focus away from the work itself.

### 11. Project cards carry almost no information
Title + one line of meta + two buttons. Every card already has `data-cat` values — used for filtering but **never rendered** — so a card never says what it's built with. 21 flat cards with no hierarchy between the Duke AI winner and a UI clone.

### 12. Refresh always jumps to the top
[`index.html:1466-1472`](index.html#L1466-L1472) sets `history.scrollRestoration = 'manual'` **and** forces `scrollTo(0,0)` on `beforeunload`. Both refresh and the back button lose the reader's place.

### 13. A dead render loop
The custom cursor's CSS is entirely commented out at [`style.css:2603-2633`](style.css#L2603-L2633), but [`script.js:756`](script.js#L756) still runs an infinite `requestAnimationFrame` loop animating the now-invisible element.

---

## Tier 2 — Polish

### 14. No SEO or social metadata
No `meta description`, no `og:title` / `og:url` / `og:description`, no canonical link. `<title>` is "Jason's Portfolio". The only Open Graph tag is a bare `og:image` still marked `<!-- CHECK THIS! -->`. Links shared to LinkedIn or Slack render unbranded.

### 15. Heading structure and alt text
Eight `<h1>` elements (one per section) — should be one `<h1>` with `<h2>` section headings. Generic alt text throughout: "Project 1" through "Project 6", "Company logo" ×2, and three different school logos all alt'd "UNC logo".

### 16. Keyboard navigation is invisible
**Zero** `:focus-visible` rules across 3,444 lines of CSS. The single `:focus` rule ([`style.css:1649`](style.css#L1649)) *removes* styling. Additionally:
- 12 `<div onclick>` handlers that keyboard users cannot reach at all
- 38 tap targets under the 44×44px minimum at mobile width

### 17. Repo hygiene
~65 MB of assets referenced nowhere in any HTML/CSS/JS:

| Orphan | Size |
|---|---|
| `fbla_animalshelter.png` | 14 MB |
| `SLT_leadership.PNG` | 11 MB |
| `models/macbook_pro_14in.glb` | 10 MB |
| `leetstreak_logo.png` | 4.9 MB |
| `models/iphone17promax.glb` | 3.9 MB |
| `skylab_drone.jpeg` | 3.1 MB |
| `cory_levy.JPEG` | 3.0 MB |

Also: nine `<img>` tags point at logo files that don't exist (inside commented-out blocks), eight resume PDFs plus a 2.1 MB screenshot sit in `assets/docs/`, and `awards.html` is a 0-byte file.

### 18. The nav ghosts
At `rgba(255, 255, 255, 0.9)` + `blur(8px)` ([`style.css:147`](style.css#L147)), section titles and card images bleed through visibly while scrolling. It reads as a rendering defect rather than an intentional frosted-glass effect. Raise the blur and lower the alpha, or make it opaque on scroll.

---

## Recommended sequencing

1. **#1 alone, first.** Roughly half your traffic — anyone arriving from a LinkedIn tap — currently lands on a page they cannot navigate. It's a ~5-line fix.
2. **#2 + #17 together** — one pass over `assets/`.
3. **#3** — three deletions.
4. **#4–#7** — a quick correctness sweep.

That block takes the site from "broken on mobile, 35 MB" to solid, and is roughly an hour of work.

Tier 1 holds the larger UX gains but involves judgment calls about what the site should *say* — worth treating as a separate design pass rather than a bug sweep.
