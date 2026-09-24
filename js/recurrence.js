/*
 * US Tax Calendar - recurrence engine.
 * Computes the actual due date for a recurring deadline in any given year,
 * from a compact recurrence rule. This mirrors (and was validated against)
 * the Python engine used to derive these rules from the site's
 * primary-source-verified data - see HANDOFF.md for the derivation method.
 *
 * Rule shapes:
 *   {type:'fixed_date', month, day, shift}
 *   {type:'annual_offset', month_offset, day: <number>|'last', shift}
 *
 * shift:true applies the standard US government-deadline convention of
 * moving a date that falls on a weekend or federal holiday to the next
 * business day. shift:false is used only where the site's verified data
 * itself demonstrates the underlying deadline is NOT moved (several state
 * payroll/sales-tax portals accept weekend-dated filings as-is).
 *
 * KNOWN LIMITATION: the federal holiday set below does not include DC
 * Emancipation Day (observed April 16, or nearby), which in some years
 * pushes the individual federal return deadline a day later than this
 * engine computes. This is disclosed in the site's methodology text.
 */
(function (global) {
  'use strict';

  function daysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  function nthWeekday(year, month, weekday, n) {
    // month is 1-indexed; weekday 0=Sun..6=Sat
    var d = new Date(year, month - 1, 1);
    var offset = (weekday - d.getDay() + 7) % 7;
    d.setDate(1 + offset + (n - 1) * 7);
    return d;
  }

  function lastWeekday(year, month, weekday) {
    var d = new Date(year, month - 1, daysInMonth(year, month));
    var offset = (d.getDay() - weekday + 7) % 7;
    d.setDate(d.getDate() - offset);
    return d;
  }

  function observed(d) {
    var dow = d.getDay();
    if (dow === 6) { var r = new Date(d); r.setDate(r.getDate() - 1); return r; }
    if (dow === 0) { var r2 = new Date(d); r2.setDate(r2.getDate() + 1); return r2; }
    return d;
  }

  var holidayCache = {};
  function federalHolidays(year) {
    if (holidayCache[year]) return holidayCache[year];
    var set = new Set();
    function add(d) { set.add(ymd(d)); }
    add(observed(new Date(year, 0, 1)));      // New Year's Day
    add(nthWeekday(year, 1, 1, 3));           // MLK Day - 3rd Monday Jan
    add(nthWeekday(year, 2, 1, 3));           // Washington's Birthday - 3rd Monday Feb
    add(lastWeekday(year, 5, 1));             // Memorial Day - last Monday May
    add(observed(new Date(year, 5, 19)));     // Juneteenth
    add(observed(new Date(year, 6, 4)));      // Independence Day
    add(nthWeekday(year, 9, 1, 1));           // Labor Day - 1st Monday Sep
    add(nthWeekday(year, 10, 1, 2));          // Columbus Day - 2nd Monday Oct
    add(observed(new Date(year, 10, 11)));    // Veterans Day
    add(nthWeekday(year, 11, 4, 4));          // Thanksgiving - 4th Thursday Nov
    add(observed(new Date(year, 11, 25)));    // Christmas
    holidayCache[year] = set;
    return set;
  }

  function ymd(d) {
    var y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), dd = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + dd;
  }

  function isWeekendOrHoliday(d) {
    var dow = d.getDay();
    if (dow === 0 || dow === 6) return true;
    return federalHolidays(d.getFullYear()).has(ymd(d));
  }

  function shiftForward(d) {
    var out = new Date(d);
    while (isWeekendOrHoliday(out)) {
      out.setDate(out.getDate() + 1);
    }
    return out;
  }

  function computeNominal(rule, year) {
    if (rule.type === 'fixed_date') {
      var day = Math.min(rule.day, daysInMonth(year, rule.month));
      return new Date(year, rule.month - 1, day);
    }
    if (rule.type === 'annual_offset') {
      var month = rule.month_offset;
      if (rule.day === 'last') {
        return new Date(year, month - 1, daysInMonth(year, month));
      }
      var d2 = Math.min(rule.day, daysInMonth(year, month));
      return new Date(year, month - 1, d2);
    }
    return null;
  }

  /**
   * Compute the actual due date for a recurring entry in a given calendar
   * year. `year` is the year the resulting date itself falls in (matching
   * how date_2026 is stored - e.g. a Q4 estimated-tax payment "for year Y"
   * that is due in January of Y+1 is looked up by passing Y+1).
   */
  function computeForYear(rule, year) {
    if (!rule) return null;
    var nominal = computeNominal(rule, year);
    if (!nominal) return null;
    var shift = rule.shift !== false;
    return shift ? shiftForward(nominal) : nominal;
  }

  /**
   * Return an array of {year, date} for every occurrence of `rule` whose
   * computed date falls within [fromDate, toDate] inclusive. Handles the
   * (rare) case where shifting pushes a date into an adjacent year by also
   * checking year-1 and year+1 candidates.
   */
  function occurrencesInRange(rule, fromDate, toDate) {
    if (!rule) return [];
    var out = [];
    var startYear = fromDate.getFullYear() - 1;
    var endYear = toDate.getFullYear() + 1;
    for (var y = startYear; y <= endYear; y++) {
      var d = computeForYear(rule, y);
      if (d && d >= fromDate && d <= toDate) {
        out.push({ year: y, date: d });
      }
    }
    out.sort(function (a, b) { return a.date - b.date; });
    return out;
  }

  global.TaxRecurrence = {
    computeForYear: computeForYear,
    occurrencesInRange: occurrencesInRange,
    shiftForward: shiftForward,
    daysInMonth: daysInMonth,
    ymd: ymd
  };
})(window);
