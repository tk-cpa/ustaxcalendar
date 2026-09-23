# US Tax Calendar - Session Handoff

Last updated: 2026-09-23 (Cowork session, batch 2: data layer + functional calendar).

## Batch 2 - the calendar is now functional

- Built `data/deadlines-federal.json` (39 entries) and `data/deadlines-states-income-tax.json` (51 entries: 50 states + DC), which did not exist before this batch - the site was previously an empty shell.
- **Federal data**: sourced directly from IRS Publication 509 (2026), fetched and read as a PDF this session (`https://www.irs.gov/pub/irs-pdf/p509.pdf`, parsed with `pdftotext`), not carried forward from any prior claim. 27 entries carry `"verification_status":"primary-source verified this session"` because their exact date was read directly out of Pub. 509's text this session (1040/1040-SR, all 1040-ES/1120 estimated installments, 1065, 1120-S, Form 2553, W-2, 1099-NEC and other 1099 recipient/IRS deadlines, 941/940/943/944/945, Form 720 Q1-Q3, Form 2290, Form 5500). 4 international-information-return entries (FBAR, 3520, 3520-A, 5471, 5472) are NOT in Pub. 509 itself (it explicitly excludes them) - these are marked `"secondary-source, pending primary-source pin"` and cite the relevant form instructions page, not independently re-fetched this session; do not upgrade their status without actually checking those instruction pages.
- Form 2290 only covers the standard July-first-use case (Aug 31, 2026) - the full month-by-month partial-year table from Pub. 509 was not built out, consistent with the original open item.
- **State data**: all 50 states + DC individual income tax due dates are populated so the calendar and filters have full state coverage, but the verification bar is lower than the federal layer and is disclosed per-entry:
  - Virginia is `"primary-source verified this session"` - fetched directly from tax.virginia.gov/when-to-file this session (May 1, 2026 original; automatic 6-month extension to Nov. 1, 2026).
  - Delaware (Apr 30), Iowa (Apr 30), Louisiana (May 15), Hawaii (Apr 20), Oklahoma (shown Apr 15, pending confirmation of a possible Apr 20 e-file accommodation date some aggregators cite), and South Carolina (standing Apr 15, with a one-time SCDOR relief extension to Oct 15, 2026 for 2025 returns tied to OBBBA conformity) are all `"secondary-source, pending primary-source pin"` - sourced from Kiplinger's and Money.com's 2026 state deadline surveys, cross-checked against each other but not against each state's own DOR site this session.
  - The other 35 states + DC are shown conforming to the federal April 15 deadline, also `"secondary-source, pending primary-source pin"`, same two aggregators as authority.
  - The 9 no-broad-income-tax states (AK, FL, NV, SD, TN, TX, WA, WY, NH) are included with `date_2026: null` so they don't appear as false deadlines in the calendar/list, but do appear correctly in the "Build your own calendar" jurisdiction picker.
  - **This state layer is not yet held to the same bar as the federal layer - primary-source verification against each state's own DOR remains the top open item**, same as before this batch; what changed is that the calendar now has real (if partially secondary-sourced) data instead of no data at all.
- Tested locally this session with a headless Chromium (Playwright) load of `index.html` served over local HTTP: the month grid renders deadline dots, the filter dropdowns populate (44 jurisdiction options, 8 categories), the deadline list table renders 81 rows, and the "Build your own calendar" checkboxes populate correctly. No console errors on load. Screenshot reviewed visually - design system renders as intended (ink/coral/mono tokens, dark cat-nav bar, dark BYOC panel, dark footer).

## Correction to prior handoff docs - read this first

A handoff prompt for this session described the site as far further along than `main` actually is (map.html, three JSON data files under `data/`, DNS/HTTPS fully live). None of that matches this branch. Verified directly this session:

- `main` contains exactly four files: `index.html`, `disclaimer.html`, `CNAME`, `HANDOFF.md`. There is no `map.html` and no `data/` directory - `data/deadlines-federal.json`, `data/deadlines-states-income-tax.json`, and `data/deadlines-cities.json` do not exist anywhere in the repo history (single commit, "Add files via upload").
- Because `index.html`'s JS fetches those two JSON files on load, **the calendar is currently non-functional as deployed** - it will render the shell (nav, hero, build-your-own-calendar UI) but the filter dropdowns, month grid, and list stay empty since `fetch()` 404s.
- Timur confirmed `main` is the correct branch and that both the repo and the domain are reachable from his side even though this session's sandboxed network could not resolve `ustaxcalendar.com` directly (it could reach `cpavalidated.com` fine, so this looks like a container-specific DNS/allowlist gap, not a real outage).
- This session cannot `git push` (proxy: "tk-cpa/ustaxcalendar is not in this session's authorized repository set") - confirmed instruction from Timur is to keep delivering via zip for manual upload through GitHub's web UI; this is expected and not a blocker.

**Do not treat the T1/T2/T3 narrative in any earlier version of this file as reflecting what's in `main` today.** Only what's listed above and in "What's live after this session" is confirmed against the actual repo this session.

## This session's batch: design system alignment only

Scope was deliberately narrowed to fixing the design system, not rebuilding the missing data layer (that's a much larger, separate verification effort - see Next build queue). Work done:

- Fetched the live CSS from **cpavalidated.com** directly (confirmed reachable, HTTP 200) and cloned **tk-cpa/extensionguide** directly (its custom domain has a cert/hostname mismatch in this sandbox, so the repo was read straight from GitHub instead of the rendered site) to get the real design tokens, not a written description of them.
- Confirmed token set (from cpavalidated.com, the more complete of the two - extensionguide's per-page `:root` is a subset that also swaps `--font-mono` to `'Courier New'` and adds status-color tokens green/amber/blue-acc/red not present on cpavalidated):
  `--ink:#111111; --ink-80:#343A40; --ink-60:#5E6166; --ink-40:#9BA0A6; --ink-20:#D9DBDE; --ink-10:#EDEEF0; --paper:#FAFAF7; --paper-white:#FFFFFF; --coral:#F65F5A; --coral-600:#E04A45; --coral-100:#FCE3E2; --navy:#071563; --navy-100:#E2E4F0; --gold:#E9A81C; --success:#4A7459; --font-display:'Oswald','Helvetica Neue Condensed','Arial Narrow',sans-serif; --font-sans:'Inter',...; --font-mono:'Cousine','SF Mono','Menlo',monospace;`
  Google Fonts import: `family=Oswald:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700`.
- Rebuilt `index.html` and `disclaimer.html` against these exact tokens: replaced the old ad hoc `--line`/`--muted` palette with the real ink/coral scale, switched the mono font from `'Courier New'` to `'Cousine','SF Mono','Menlo'` per the confirmed-live cpavalidated value, made mono load-bearing the way both sibling sites use it (dow labels, badges, table headers, footer, quick-add links, byoc group labels) rather than a sparse accent, matched the dark `.cat-nav` sub-nav bar pattern (ink background, coral 3px bottom border, mono uppercase links) used on both siblings, matched the ink/coral footer convention, and added the `a tk.cpa resource` byline under the brand mark the way extensionguide's nav does.
- Preserved every existing JS hook/class name (`.dot`, `.cell`, `.badge`, `.byoc-box`, etc.) - only the CSS declarations changed, not the markup structure or IDs the script depends on, so no functional regression from this batch.
- `map.html` was not created this session - it doesn't exist yet, so there was nothing to restyle. When it's built, follow extensionguide's `map.html` pattern directly (confirmed this session): D3 v7 (`cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js`) + `topojson-client@3` + `us-atlas@3/states-10m.json`, both via jsdelivr, `d3.geoAlbersUsa()` projection - this matches what the original task brief described, so that part of the brief was accurate even though the file itself isn't in `main`.

## What's live in `main` after this session

- `index.html` - calendar app shell, restyled to the confirmed design system, now functional against real data.
- `disclaimer.html` - restyled to match.
- `data/deadlines-federal.json` - 39 entries (see batch 2 notes above for verification breakdown).
- `data/deadlines-states-income-tax.json` - 51 entries, 50 states + DC (see batch 2 notes above for verification breakdown).
- `CNAME` - `ustaxcalendar.com`.
- Still missing: `map.html`, `data/deadlines-cities.json`, and the `href="map.html"` link in the nav currently points to a page that doesn't exist yet - fix that link or build the page next, whichever comes first.

## Next build queue (in priority order)

1. **Primary-source verify all 50 states + DC individual income tax due dates against each state's own DOR.** This is the single biggest remaining gap - the calendar now shows a date for every jurisdiction, but only Virginia is independently confirmed against a .gov source; everything else rides two secondary aggregators (Kiplinger, Money.com) cross-checked against each other, not against primary sources.
2. Fix or remove the `map.html` nav link (currently a dead link since the page doesn't exist), then build `map.html` and `data/deadlines-cities.json` together - use extensionguide's confirmed pattern: D3 v7 (`cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js`) + `topojson-client@3` + `us-atlas@3/states-10m.json`, both via jsdelivr, `d3.geoAlbersUsa()` projection.
3. Primary-source verify the 4 international-information-return federal entries (FBAR, 3520, 3520-A, 5471, 5472) against their actual form instructions pages - currently cited but not independently re-fetched this session.
4. State corporate/pass-through/estimated-tax due dates, state sales & use tax, state payroll (SUI/SUTA) deadlines.
5. Federal estate/gift tax (706/709) and exempt-org (990 series) deadlines - not covered by Pub. 509, need separate primary-source research.
6. Form 8938, Form 8865, full Form 2290 partial-year table (currently only the July-first-use full-year case is in the data).
7. Lint gate (em-dash check, forbidden strings, disclaimer link, canonical tags) - build or port a script before the next data-heavy batch ships; this session's checks were done by hand with grep, not an automated script.

## Delivery workflow

1. Build the batch.
2. Commit locally in this session's clone.
3. `git push` will fail (repo not authorized for this session - expected, not a blocker).
4. Zip the working tree (excluding `.git/`) and deliver via SendUserFile.
5. Timur uploads via GitHub's web "Add file -> Upload files" UI in `tk-cpa/ustaxcalendar`, `main` branch, root - this overwrites in place and GitHub Pages rebuilds automatically.
