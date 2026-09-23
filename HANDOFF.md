# US Tax Calendar - Session Handoff

Last updated: 2026-09-23 (Cowork session, design-system alignment batch).

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

- `index.html` - calendar app shell, restyled to the confirmed design system. Non-functional (empty grid/list/filters) until `data/` exists.
- `disclaimer.html` - restyled to match.
- `CNAME` - `ustaxcalendar.com`.
- No `map.html`, no `data/` directory, no JSON data files.

## Next build queue (in priority order - unchanged in substance from the original brief, resequenced for what's actually needed first)

1. **Build `data/deadlines-federal.json` and `data/deadlines-states-income-tax.json` from scratch** - these do not exist in `main` despite being referenced by `index.html`'s fetch calls. This is the actual top priority, above state verification, because without it the live site shows nothing. Primary-source each entry (IRS Pub. 509 2026 for federal; each state's own DOR for state individual income tax due dates) rather than porting unverified numbers from an old handoff doc.
2. Once the federal + state data exists, build `data/deadlines-cities.json` and `map.html` (see the confirmed D3/topojson/us-atlas pattern above).
3. Primary-source verify all 50 states + DC individual income tax due dates against each state's own DOR - do not carry forward any prior session's claimed verification status without re-checking, since no prior verified data survived into `main`.
4. State corporate/pass-through/estimated-tax due dates, state sales & use tax, state payroll (SUI/SUTA) deadlines.
5. Federal estate/gift tax (706/709) and exempt-org (990 series) deadlines - not covered by Pub. 509, need separate primary-source research.
6. Form 8938, Form 8865, full Form 2290 partial-year table.
7. Lint gate (em-dash check, forbidden strings, disclaimer link, canonical tags) - build or port a script before the next data-heavy batch ships.

## Delivery workflow

1. Build the batch.
2. Commit locally in this session's clone.
3. `git push` will fail (repo not authorized for this session - expected, not a blocker).
4. Zip the working tree (excluding `.git/`) and deliver via SendUserFile.
5. Timur uploads via GitHub's web "Add file -> Upload files" UI in `tk-cpa/ustaxcalendar`, `main` branch, root - this overwrites in place and GitHub Pages rebuilds automatically.
