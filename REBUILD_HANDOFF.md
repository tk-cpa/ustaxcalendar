# ustaxcalendar.com rebuild — handoff (2026-09-24)

## User's request (verbatim intent)
Full rework of ustaxcalendar.com. Don't like the current dropdown/calendar-grid
UI. Requirements:
- All dates recurring & projected well into the future, not just through
  spring 2027 (current site is effectively single-year).
- Different visual/UX format entirely, not the dropdown-filter style.
- Fix broken Google Calendar subscription (current one-time .ics download
  doesn't work as a live subscription).
- Add calendar subscription capability.
- Redo the site "from scratch in a different style."
- KEEP the interactive US map (map.html) — explicit request.

Scope was clarified via AskUserQuestion; user picked all three
"Recommended" options:
1. **Browse style: grouped list/timeline.** Single scrollable page, deadlines
   grouped by month, jurisdiction/category shown as tags/badges (not a
   dropdown filter grid). Closer to a reference doc than an app.
2. **Recurrence: rule-based, computed live.** Each deadline stores a rule
   (e.g. "15th day of 3rd month annually" + weekend/holiday shift flag).
   Actual dates computed in JS for any year — no yearly manual data updates.
3. **Subscriptions: static feeds per jurisdiction/category.** Pre-built
   `.ics` files hosted at stable `webcal://` URLs on GitHub Pages —
   auto-refreshing since they're live URLs, not one-time downloads.

## Status: Tasks #11–13 DONE and validated. #14–17 not started.

| # | Task | Status |
|---|------|--------|
| 11 | Design recurrence data schema v2 | DONE |
| 12 | Parser: derive recurrence rules from verified data | DONE |
| 13 | Build JS date-rule engine | DONE, validated |
| 14 | Rebuild front-end: grouped/timeline UI, no dropdown grid | NOT STARTED |
| 15 | Re-integrate map.html with new site structure | NOT STARTED |
| 16 | Build subscribable .ics feeds (static, per jurisdiction/category) | NOT STARTED |
| 17 | Test, lint, commit, push live | NOT STARTED |

## What's been built and verified (as of this handoff)

**Location:** `/home/claude/ustaxcalendar/` (this is a git repo, remote
`origin` = `https://github.com/tk-cpa/ustaxcalendar.git`, branch `main`,
currently **10 commits ahead of origin/main, not yet pushed**, plus
uncommitted working-tree changes — see "Git state" below.)

### Data: `data/*.json` (9 files, 771 entries, 743 with a `date_2026`)
Every dated entry now has a `recurrence` field:
- `null` for the 28 entries with no fixed date.
- Otherwise an object:
  - `{"type":"fixed_date","month":M,"day":D,"shift":bool}` — same
    calendar day every year.
  - `{"type":"annual_offset","day":N|"last","month_offset":M,"shift":bool}`
    — day N (or last day) of month M every year.
  - `shift:true` = apply the standard US government weekend/federal-holiday
    shift-forward rule. `shift:false` = the verified data shows this
    deadline does NOT shift (some state portals accept weekend-dated
    filings as-is).

**Validation, both re-run clean just before this handoff:**
```
python3 /tmp/rebuild/final_validate2.py
# total_with_date: 743 checked: 743 ok: 743 bad: 0 no_date: 28

node /tmp/rebuild/test_js_engine.js
# total: 743, ok: 743, bad: 0
```
Every entry's `recurrence` rule exactly reproduces its already
primary-source-verified `date_2026` value, in both the Python derivation
engine and the shipped JS engine.

Two real data-correctness bugs were found and fixed during this process
(pre-existing in the "100% verified" data, surfaced by the recurrence
engine's cross-year consistency requirement — a single-year snapshot
doesn't catch these):
1. **14 pass-through-entity state entries** had `date_2026: "2026-03-15"`
   (a Sunday, unshifted) inconsistent with 6 sibling states already
   correctly showing the shifted `"2026-03-16"`. Corrected to
   `"2026-03-16"` with a disclosure note appended to each entry's `rule`
   and `description` fields (not silently changed). Affected IDs:
   state-pte-connecticut, -new-hampshire, -rhode-island, -west-virginia,
   -south-carolina, -georgia, -alabama, -mississippi, -wisconsin,
   -minnesota, -nebraska, -new-mexico, -arizona, -california.
2. **fed-941-q3 / fed-720-q3** had `date_2026: "2026-10-31"` (a Saturday,
   unshifted) inconsistent with fed-941-q4's correctly-shifted value.
   Corrected to `"2026-11-02"` with a disclosure note appended to `rule`.

16 federal.json/federal-additional.json entries have HAND-VERIFIED
`recurrence` rules (fed-1065-original, fed-1120s-original, fed-2553,
fed-w2-ssa, fed-1099nec, fed-1099-general-recipient, fed-940, fed-943,
fed-944, fed-945, fed-1099b-s-misc-recipient, fed-1099-irs-paper,
fed-2290-03/-07/-10/-12) — these override the automated derivation
because their terse rule text doesn't state the exact statutory day.
All 16 independently verified to reproduce date_2026 exactly.

**Known, disclosed methodology limitation:** the federal holiday set used
for shift-forward logic (New Year's, MLK, Washington's Birthday, Memorial
Day, Juneteenth, Independence Day, Labor Day, Columbus Day, Veterans Day,
Thanksgiving, Christmas) does NOT include DC Emancipation Day (observed
~April 16), which in some years pushes the actual IRS individual-return
deadline one day later than this engine computes. This is documented in
the `js/recurrence.js` header comment and needs to be surfaced in the
site's methodology/disclaimer text (part of task #14 or a dedicated pass).

### Engine: `js/recurrence.js`
Production JS port, exposes `window.TaxRecurrence`:
- `computeForYear(rule, year)` — actual due date for that year.
- `occurrencesInRange(rule, fromDate, toDate)` — all occurrences (any
  years) whose computed date falls in a range; used for both display and
  .ics generation.
- `shiftForward(d)`, `daysInMonth`, `ymd` — helpers.
- Full federal-holiday calculation logic ported from the Python engine,
  including the DC Emancipation Day caveat in comments.
- Currently `require()`-able in Node via a `global.window = global` shim
  (used by the test harness) and browser-loadable as a plain `<script>`.

### Scratchpad / derivation tooling (not shipped, but needed if data
changes again): `/tmp/rebuild/`
- `engine.py` — Python engine + `derive_rule_v2` (quarter-aware structural
  derivation → text-regex parse → `back_infer` heuristic fallback).
- `run_v2.py` — runs derivation across all data files, writes debug
  `_recurrence` field.
- `consistency_pass.py` — forces jurisdiction/series-consistent `shift`
  values across `-q1..-q4` siblings of the same base deadline.
- `final_validate2.py` — validates the final clean `recurrence` field
  against `date_2026` (this is the corrected version; the original
  `final_validate.py` checks the now-removed debug `_recurrence` field and
  will report `total: 0` — use `final_validate2.py` instead, or fix it if
  reused).
- `test_js_engine.js` — Node cross-validation of `js/recurrence.js`
  against `date_2026` (already correctly reads the clean `recurrence`
  field — no fix needed).
- `spotcheck.js` — prints multi-year forward projections for a handful of
  representative entries; useful for a visual sanity pass before/during
  front-end work.

## Not yet touched (old design, will need rewrite/replace)
- `index.html` — still the OLD dropdown/calendar-grid UI. This is the
  main target of task #14.
- `map.html` — the interactive US map to KEEP per the user's explicit
  request. Needs re-integration into whatever new site structure task #14
  produces (task #15), but the map itself should not need a redesign
  unless it visually clashes with the new style.
- `disclaimer.html` — likely needs at minimum the DC Emancipation Day
  caveat added; otherwise probably fine as-is, review during #14/#17.
- `HANDOFF.md` — the OLD handoff doc describing the old design/data
  pipeline. Should probably be superseded or merged with this document
  once the rebuild ships (task #17).

## Git state — read before doing anything with git
```
origin = https://github.com/tk-cpa/ustaxcalendar.git
branch main is 10 commits ahead of origin/main (NOT pushed)
Uncommitted changes: all 9 data/*.json files modified (the recurrence
  field additions/corrections above), js/ directory untracked (new
  recurrence.js)
```
Push access to the `tk-cpa` GitHub org (repos: cpavalidated,
globaltaxguide, extensionguide, ustaxcalendar) was set up and confirmed
working earlier this session via `gh` CLI inside the Cowork device VM
(`mcp__remote-devices__device_bash`), using a classic PAT with `repo` +
`read:org` scopes. Key constraints from the user's own runbook:
- Never run `gh auth login` interactively — it hangs.
- Never run git inside a mounted folder (`~/mnt/...`) — file-locking
  issues. Clone/work in the VM's own `$HOME` instead
  (`$HOME/tk-cpa-sites/ustaxcalendar` was the working clone location).
- This cloud container's work has been happening in
  `/home/claude/ustaxcalendar` (a separate clone). Task #17 needs to
  reconcile/transfer finished work from this cloud-container clone into
  the VM clone (or push directly from wherever the final commit is made)
  before pushing live. Do not assume the two clones are in sync — check
  both before pushing.

## TK operating framework reminders (still apply for the rest of this job)
No em dashes. No fabricated citations/rates/thresholds/Client facts. No
sign-offs on emails. Zero branding on deliverables. Never mix tk.cpa and
o9 data (n/a here — this is a tk.cpa-adjacent public site, not Client
work, but formatting/citation discipline still applies). Run the full
completion gate (lint, workpaper-review-style confidence tagging isn't
directly applicable to a code/data rebuild, but the manager-pass +
partner-pass math/citation/consistency re-check absolutely is) before
declaring any sub-deliverable (front-end, map integration, ics feeds)
done — not just at the very end.

## Immediate next step for the new chat
Proceed directly to **Task #14**: rebuild `index.html` as the new grouped/
timeline UI (deadlines grouped by month, jurisdiction/category as tags,
no dropdown grid), wired to `js/recurrence.js` for live date computation
across years. Then #15 (map re-integration), #16 (static .ics subscription
feeds using `TaxRecurrence.occurrencesInRange`), #17 (test/lint/commit/
push, reconciling the two clones per "Git state" above). No further
scoping questions are needed — the three AskUserQuestion answers above
are the locked-in design direction; proceed autonomously and flag only
genuine blocking gaps per the standing verification discipline.
