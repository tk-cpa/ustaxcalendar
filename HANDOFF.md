# US Tax Calendar - Session Handoff

Last updated: 2026-09-23, T2 build (same session, second batch: "Build your own calendar" export feature + first primary-source verification pass on state due dates).

## T2 additions (this session, second batch)

- **"Build your own calendar" flagship feature, live in index.html**: checkbox pickers for jurisdiction (Federal + each state) and filing type/category, a live selected-count, and a "Download my calendar (.ics)" button that generates a real iCalendar file client-side (no backend - pure JS `Blob` download, works on static GitHub Pages) with one all-day VEVENT per selected deadline, a 7-day-before reminder (VALARM), and the rule/authority/source in the event description. Imports cleanly into Google Calendar, Outlook, and Apple Calendar.
- Every deadline's detail modal now also has one-click "+ Add to Google Calendar" and "+ Add to Outlook" links (Google's and Outlook's own quick-add URL schemes - no auth, no backend, opens their native "add event" screen pre-filled).
- Known, disclosed limitation: none of this is a live "subscribe" feed that auto-updates in the user's calendar forever - that would need a server generating .ics per request, which a static GitHub Pages site can't do. The download/quick-add approach covers the realistic use case without needing backend infrastructure. Worth revisiting if Timur wants a subscribe-URL version later (would need a small serverless function, e.g. a Cloudflare Worker or Vercel function, outside the current static-only architecture).
- **State due-date primary-source verification, batch 1 of N**: independently checked directly against each state's own Department of Revenue this session (not the secondary aggregator) - California, Delaware, Hawaii, Iowa, Louisiana, Oklahoma, South Carolina, Virginia. All 8 confirmed the aggregator's date was right, but two extended-deadline details were corrected from what a guess would have produced: Iowa's automatic extension is to **Nov. 2, 2026** (not Oct. 31 - the site's account before this check had this wrong), and Virginia's/Louisiana's extended dates (Nov. 2 and Nov. 16 respectively) are now stated explicitly where they weren't before. South Carolina has a one-time, OBBBA-conformity-driven filing extension to Oct. 15, 2026 announced Mar. 26, 2026 for all 2025 returns - noted in the description field as a one-off relief measure, not encoded as the standing rule, since next year's SCDOR won't necessarily repeat it.
- These 8 states now carry `"verification_status": "primary-source verified this session"` in the JSON. The remaining 34 states with a date still carry `"secondary-source, pending primary-source pin"` - unchanged from T1, still an open item, still surfaced as an "Open item" badge in the app.

## What this is

Site name: **US Tax Calendar** (a tk.cpa resource). Domain: **ustaxcalendar.com** (repo created this session, not yet purchased/DNS-pointed - confirm with Timur before assuming the domain is live). Repo: **tk-cpa/ustaxcalendar** on GitHub, public. Deployment target: GitHub Pages, branch `main`, root, static HTML (no build step) - same pattern as extensionguide and cpavalidated.

Format: **interactive calendar** (per Timur's explicit choice), not a static-page-per-jurisdiction site like extensionguide. One `index.html` fetches two JSON data files and renders a filterable month-grid calendar plus a searchable table, filterable by jurisdiction, category, and free-text (form/filer).

Build order: **federal + all states in parallel from day one** (per Timur's explicit choice) - the data schema treats Federal and each state as equal jurisdiction values from the start. In practice, full-scope population still has to happen in verified batches; this session's batch is described below.

## What's live after this session (T1)

- `index.html` - the calendar app itself.
- `disclaimer.html`.
- `data/deadlines-federal.json` - 40 entries, sourced from IRS Publication 509 (2026), the current Instructions for Form 3520-A, and FinCEN's own FBAR guidance (this last one re-confirmed against the tk.cpa Extension Guide project's own prior verification, not re-verified independently this session). Covers: Form 1040/1040-SR (original + automatic-2-month-abroad + extended), 1040-ES Q1-Q4 (incl. the Jan 15 final installment for the prior year), 1120 + estimated installments Q1-Q4, 1065 (original + extended), 1120-S (original + extended), Form 2553 S-election, Form 3520, Form 3520-A, FBAR/FinCEN 114, W-2 to employees and to SSA, 1099-NEC, general 1099 recipient copies, 1099-B/S/certain-MISC recipient copies, 1099 series IRS paper and e-file deadlines, Forms 941 (all 4 quarters), 940, 943, 944, 945, Form 720 (Q1-Q3 shown; Q4 lands in the following January, out of this calendar's current scope), Form 2290 full-year deadline, Form 5500/5500-EZ, and Forms 5471/5472 (both stated as riding the underlying income tax return's due date, not independently re-derived).
- `data/deadlines-states-income-tax.json` - 51 entries (50 states + DC). 42 have a due date (all states with a broad individual income tax, plus DC); 9 are flagged `no-filing-required` (AK, FL, NV, SD, TN, TX, WA, WY, NH - NH's repeal of the Interest & Dividends Tax was already verified in the Extension Guide project and is cited from there, not re-verified independently this session).

## Disclosed gap - state layer is a first pass, not primary-source verified

The 42 state due dates with an actual date are sourced from a single secondary aggregator (Money.com, "When Are State Taxes Due? Here Are the 2026 Deadlines," published/modified March 2026), **not** independently checked against each state's own Department of Revenue this session, except:
- California - cross-checked directly against ftb.ca.gov during this session (April 15, matches the aggregator).
- Virginia, Delaware, Hawaii, Louisiana, Iowa - dates match what Timur already knew as established exceptions, but were not re-verified against each state's own DOR site this session.

Every entry in `deadlines-states-income-tax.json` with a date carries `"verification_status": "secondary-source, pending primary-source pin"` and the app surfaces an "Open item" badge on click. **Do not treat this layer as verified** until each state is individually pinned to its own primary source, the same discipline used for extensionguide's sales-and-use-tax survey. This is the top item on the build queue below.

## Explicitly not yet built (named, not rounded up)

- State income tax due dates: NOT yet primary-source verified (see above) - the single biggest open item.
- State/local **payroll tax** deadlines (SUI/SUTA quarterly reports, state withholding).
- State **sales and use tax** filing deadlines.
- State **estimated tax** payment schedules (most conform to April/June/Sept/Jan but not all - not yet checked).
- State **corporate/pass-through entity** return due dates (1120/1065/1120-S equivalents by state).
- **City/local** income tax deadlines (NYC, Philadelphia, Ohio municipalities, Michigan cities, etc. - extensionguide already has verified due-date-adjacent extension mechanics for these; the underlying original due dates have not yet been pulled into this calendar).
- Federal **estate/gift tax** (706/709) and **exempt organization** (990 series) deadlines - explicitly out of scope for IRS Pub. 509 itself (Pub. 509 says so directly) and not yet separately researched here.
- Form 8938 (FATCA) - rides the income tax return like 5471/5472; not yet added as its own entry.
- Form 8865 (foreign partnerships) - not yet added.
- Form 2290 partial-year/monthly first-use deadlines beyond the July/August full-year date - Pub. 509 has the full month-by-month table; only the headline date was pulled in this session.
- A design system was built fresh for this site this session (coral/ink/paper, Oswald+Inter+Courier New) matching the visual language described for extensionguide/cpavalidated, but the actual extensionguide/cpavalidated CSS files were not available to copy from directly in this session - if pixel-parity with those sites matters, diff against their live CSS in a future session.

## GitHub push status

Same blocker as extensionguide and cpavalidated: this session's container has no GitHub credential configured at all (confirmed by testing - no token, no netrc, no credential helper; `git push` fails immediately on "could not read Username"). Delivery is via zip, per the established workaround - see below.

## Repo structure and conventions (carried over from extensionguide/cpavalidated)

- Static HTML, no build step, CSS/JS inline in `index.html` (Google Fonts only external dependency).
- Design tokens: coral #F65F5A / ink #111111 / paper #FAFAF7. Oswald (display) + Inter (sans) + Courier New (mono, used sparingly).
- `data/*.json` is the single source of truth for deadline content; `index.html` fetches it client-side. Do not hardcode deadline data into the HTML/JS - add it to the JSON files so it stays one source of truth, matching extensionguide's `extensions-data.json` pattern.
- Content hard rules (tk.cpa operating framework): no em dashes; forbidden strings 109025/AC58472/P00646638/93250/Knyazev/"Prepared by" must never appear; zero extra branding beyond "a tk.cpa resource" footer.
- Every entry's `authority` field must name a specific, checkable source - a bare "verified" claim with no source is not acceptable per this practice's own rules.

## Next build queue (in priority order)

1. **Primary-source verify the remaining 34 state income tax due dates** against each state's own Department of Revenue (8 of 42 done as of T2 - see above).
2. State corporate/pass-through/estimated-tax due dates, jurisdiction by jurisdiction.
3. City/local income tax original due dates (pull from the extensionguide project's already-verified local-jurisdiction pages where the underlying due date is stated, cite forward from there).
4. State sales/use tax and payroll (SUI/SUTA) filing deadlines.
5. Round out federal international information returns: Form 8938, Form 8865, and the full Form 2290 partial-year table.
6. Federal estate/gift tax (706/709) and exempt-org (990 series) deadlines - not covered by Pub. 509, need separate primary-source research.
7. Confirm ustaxcalendar.com domain purchase/DNS status with Timur before assuming GitHub Pages + custom domain is live end to end.
8. Lint gate pass (em-dash check, forbidden strings, disclaimer link, canonical tags) has not yet been run as an automated script on this site the way it has been on extensionguide - build or port that script before the next batch ships.

## Delivery workflow (same as extensionguide, until push is fixed)

1. Build the batch.
2. `git init && git add -A && git commit -m "..."` locally.
3. Attempt `git push origin main` once; expect it to fail (no credential configured in this container at all); do not dwell on it.
4. `zip -r /mnt/user-data/outputs/ustaxcalendar-<batch-name>.zip .` from `/home/claude/ustaxcalendar` (exclude `.git/`).
5. Deliver the zip.
6. Ask Timur to upload via GitHub's web "Add file -> Upload files" UI in `tk-cpa/ustaxcalendar` (create the repo first if it doesn't exist yet).
