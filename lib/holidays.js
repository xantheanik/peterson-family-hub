// Computes the 11 U.S. federal holidays for any given year. Dates that fall
// on an nth weekday (e.g. "3rd Monday in January") are calculated, so this
// stays correct every year with no manual updates.

function fmt(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

// month is 0-indexed; weekday is 0=Sun..6=Sat; n is 1-based (1 = first).
function nthWeekdayOfMonth(year, month, weekday, n) {
  const first = new Date(year, month, 1);
  const day = 1 + ((weekday - first.getDay() + 7) % 7) + (n - 1) * 7;
  return new Date(year, month, day);
}

function lastWeekdayOfMonth(year, month, weekday) {
  const last = new Date(year, month + 1, 0);
  const day = last.getDate() - ((last.getDay() - weekday + 7) % 7);
  return new Date(year, month, day);
}

export function federalHolidays(year) {
  const H = (date, title) => ({ date: fmt(date), title });
  return [
    H(new Date(year, 0, 1), "New Year's Day"),
    H(nthWeekdayOfMonth(year, 0, 1, 3), "Martin Luther King Jr. Day"),
    H(nthWeekdayOfMonth(year, 1, 1, 3), "Presidents' Day"),
    H(lastWeekdayOfMonth(year, 4, 1), "Memorial Day"),
    H(new Date(year, 5, 19), "Juneteenth"),
    H(new Date(year, 6, 4), "Independence Day"),
    H(nthWeekdayOfMonth(year, 8, 1, 1), "Labor Day"),
    H(nthWeekdayOfMonth(year, 9, 1, 2), "Columbus Day"),
    H(new Date(year, 10, 11), "Veterans Day"),
    H(nthWeekdayOfMonth(year, 10, 4, 4), "Thanksgiving"),
    H(new Date(year, 11, 25), "Christmas Day"),
  ];
}
