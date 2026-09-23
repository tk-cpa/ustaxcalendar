# US Tax Calendar - Session Handoff

Last updated: 2026-09-23 (Cowork session, batch 3: full state primary-source verification + city layer + map).

## Batch 3 - every state, every city, primary-source verified; map.html built

Scope for this batch, per explicit instruction: primary-source verify all 50 states + DC individual income tax due dates against each state's own Department of Revenue, and build the city/local tax layer plus the interactive map. This was the literal ask ("every state every city") - it does not cover the rest of the original 15-item build queue (state corporate/sales/payroll tax, federal estate/exempt-org, Form 8938/8865/2290 partial-year table); those remain open, listed below.

**State individual income tax data - rebuilt (`data/deadlines-states-income-tax.json`, 51 entries, 50 states + DC):**
- All 42 taxed jurisdictions' (41 states + DC) ORIGINAL due dates are now `"primary-source verified this session"`, fetched directly from each jurisdiction's own .gov revenue/tax agency page this session (not carried forward from the prior batch's secondary-aggregator build). New Hampshire's no-broad-income-tax status is also primary-verified.
- Real, non-obvious exceptions found and captured during verification: Delaware (Apr 30), Iowa (Apr 30), Virginia (May 1 original / Nov 1 extended), Louisiana (May 15 / Nov 15 extended), Hawaii (Apr 20 / Oct 20 extended), Kansas (Apr 15 standard but Aug 15, 2026 extension deadline - confirmed via KS Pub. KS-1515, not the more common Oct 15 pattern), South Carolina (Apr 15 standard, plus a one-time SCDOR relief extension to Oct 15, 2026 for 2025 returns tied to OBBBA conformity, confirmed directly at dor.sc.gov), Oklahoma (confirmed standard Apr 15 via direct fetch, contradicting a secondary aggregator's claim of a separate e-file accommodation date - that claim does not appear on Oklahoma's own site and was not used).
- The 8 no-broad-income-tax states other than NH (AK, FL, NV, SD, TN, TX, WA, WY) remain `"secondary-source, pending primary-source pin"` - their no-tax status is well-established and uncontroversial but each state's own site was not individually re-fetched this session solely to confirm a fact with no filing date attached to it.
- Connecticut: the extended due date field is left `null` (not populated) rather than risk carrying forward an apparently erroneous "October 15, 2025" transcription surfaced during research - flagged here as a genuine open item, not silently resolved.
- Verified 51 unique entries, no duplicates (programmatic assertion run against the build script's output).

**City/local tax layer - new (`data/deadlines-cities.json`, 10 entries, 8 jurisdictions):**
- New York City (rides the NY State return, no separate filing - primary-verified), Philadelphia BIRT (primary-verified), Philadelphia NPT (primary-verified), Philadelphia Earnings Tax (secondary-source - inferred by pattern from BIRT/NPT, not independently fetched), Ohio Municipalities/RITA Form 37 (primary-verified via RITA's official 2025 Form 37 Instructions PDF), Michigan Cities/Detroit (primary-verified via michigan.gov - confirms the Apr 15 date reflects Michigan's 2015 takeover of Detroit city-tax administration, not the older pre-2015 Apr 30 date), Kansas City MO RD-109 (secondary-source - kcmo.gov's own FAQ ties a refund deadline to "the federal income tax deadline" but does not explicitly state the original return due date), St. Louis MO E-1 (primary-verified via stlouis-mo.gov), Portland/Multnomah County OR Form SP (primary-verified via portland.gov, citing specific municipal/county code sections), San Francisco Annual Business Tax Return (primary-verified via sftreasurer.org - genuinely earlier deadline, March 2, 2026, not the Apr 15 pattern most jurisdictions use).
- 8 of 10 entries are `"primary-source verified this session"`; 2 (Philadelphia Earnings Tax, Kansas City MO) are `"secondary-source, pending primary-source pin"`, disclosed as such in the data and not overclaimed.

**`index.html` wired to the city data:** `load()` now fetches and merges all three JSON files (`deadlines-federal.json`, `deadlines-states-income-tax.json`, `deadlines-cities.json`). Tested this session: 52 jurisdiction filter options (Federal + 50 states + DC + city jurisdictions collapse under their own names), 91 rows in the matching-deadlines table, 51 jurisdiction checkboxes in the Build-Your-Own-Calendar panel, zero console errors on load.

**`map.html` - built new**, following extensionguide's confirmed pattern (D3 v7 via cdnjs, topojson-client v3 + us-atlas v3 via jsdelivr, `d3.geoAlbersUsa()` projection). Differs from extensionguide's version by necessity: extensionguide links each state/city to its own dedicated page; ustaxcalendar has no per-state pages, so clicking a state or city pin instead deep-links to `index.html?jurisdiction=<name>`, which `populateFilters()` now reads via `URLSearchParams` and pre-selects in the jurisdiction dropdown. Tested this session: 51 live (coral) states render and are clickable, 8 city pins render at their correct lon/lat and are clickable, the deep-link filter was tested end to end (`index.html?jurisdiction=San%20Francisco%2C%20CA` correctly pre-filters the list to 1 matching row), zero console errors.

**Nav updated:** the `Map` link, previously removed because the page didn't exist, is back in `.cat-nav` on both `index.html` and `map.html` and now points to a real page.

**Disclaimer copy on `index.html` corrected:** the old text ("state dates are a first-pass build... pending independent primary-source verification") was stale as of this batch and has been rewritten to accurately describe the current, mostly-primary-verified state.

**Lint:** re-ran the em-dash check and the forbidden-strings check (109025, AC58472, P00646638, 93250, Knyazev, "Prepared by") across `index.html`, `disclaimer.html`, `map.html`, `HANDOFF.md`, and all three `data/*.json` files - zero hits, by hand with grep (still no automated lint script - see open items).

**Tested locally this session** with a local HTTP server + headless Chromium (Playwright): full calendar load (federal + state + city data merged, 91 rows, 52 jurisdiction options, 8 categories), the jurisdiction deep-link from the map, and `map.html`'s render (51 live states, 8 city pins) - all confirmed with zero console errors, screenshots reviewed visually.

## What remains genuinely open after this batch (named plainly, not rounded past)

- Philadelphia Earnings Tax and Kansas City MO RD-109 due dates are secondary-sourced (pattern-inferred / indirectly referenced) - their own primary pages should be re-fetched to either confirm or correct the assumed Apr 15 date.
- The 8 no-broad-income-tax states other than NH (AK, FL, NV, SD, TN, TX, WA, WY) are secondary-sourced for their no-tax status - low risk (no filing date to get wrong) but not independently re-confirmed this session.
- Connecticut's extended due date is genuinely unresolved - left blank rather than guessed; a research pass surfaced an "October 15, 2025" figure that is almost certainly a transcription error (inconsistent with the standard 6-month-from-April-15-2026 pattern) but was not independently corrected against CT DRS's own site this session.
- The 4 international information-return federal entries (FBAR, 3520, 3520-A, 5471, 5472) remain secondary-sourced, same as batch 2 - not in Pub. 509 and not independently re-fetched this session.
- No automated lint script exists yet - both batches' lint passes were done by hand with grep.
- Everything outside individual income tax + the named 8 cities (state corporate/pass-through tax, state sales/payroll tax, federal estate/gift/exempt-org deadlines, Form 8938/8865, full Form 2290 partial-year table) is out of scope for this batch and was not touched - see Next build queue below, carried forward unchanged from batch 2.

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

- `index.html` - calendar app shell, restyled to the confirmed design system, functional against federal + state + city data, jurisdiction deep-link via `?jurisdiction=` query param.
- `disclaimer.html` - restyled to match.
- `map.html` - new this batch: interactive US map, 50 states + DC + 8 city pins, each clickable through to a filtered calendar view.
- `data/deadlines-federal.json` - 39 entries (see batch 2 notes above for verification breakdown).
- `data/deadlines-states-income-tax.json` - 51 entries, 50 states + DC, all 42 taxed jurisdictions' original due dates primary-source verified this session (see batch 3 notes above).
- `data/deadlines-cities.json` - new this batch: 10 entries across 8 city/local jurisdictions, 8 primary-source verified this session (see batch 3 notes above).
- `CNAME` - `ustaxcalendar.com`.
- `HANDOFF.md` - this file.

## Next build queue (in priority order)

1. Primary-source verify the 2 secondary-sourced city entries (Philadelphia Earnings Tax, Kansas City MO RD-109) and resolve Connecticut's blank extended-due-date field.
2. Primary-source verify the 4 international-information-return federal entries (FBAR, 3520, 3520-A, 5471, 5472) against their actual form instructions pages - currently cited but not independently re-fetched this session.
3. State corporate/pass-through/estimated-tax due dates, state sales & use tax, state payroll (SUI/SUTA) deadlines.
4. Federal estate/gift tax (706/709) and exempt-org (990 series) deadlines - not covered by Pub. 509, need separate primary-source research.
5. Form 8938, Form 8865, full Form 2290 partial-year table (currently only the July-first-use full-year case is in the data).
6. Lint gate (em-dash check, forbidden strings, disclaimer link, canonical tags) - build or port a script before the next data-heavy batch ships; every batch so far has been checked by hand with grep, not an automated script.
7. Additional city/local jurisdictions beyond the 8 built this batch, if desired (this batch covered the specific 8 named in the original build queue).

## Delivery workflow

1. Build the batch.
2. Commit locally in this session's clone.
3. `git push` will fail (repo not authorized for this session - expected, not a blocker).
4. Zip the working tree (excluding `.git/`) and deliver via SendUserFile.
5. Timur uploads via GitHub's web "Add file -> Upload files" UI in `tk-cpa/ustaxcalendar`, `main` branch, root - this overwrites in place and GitHub Pages rebuilds automatically.
