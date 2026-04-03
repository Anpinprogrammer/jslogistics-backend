/**
 * Date utilities for America/Bogota timezone (UTC-5, no DST).
 * Colombia does not observe Daylight Saving Time.
 *
 * IMPORTANT: Never use new Date().toISOString().split('T')[0] to get today's date —
 * toISOString() always returns UTC, which can be the wrong calendar day in Bogota.
 */

/**
 * Returns today's date as YYYY-MM-DD in Colombia time (America/Bogota).
 */
function getTodayBogota() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/**
 * Given a YYYY-MM-DD string (or today in Bogota if omitted), returns the
 * Saturday–Friday week boundaries that contain that date.
 *
 * @param {string} [dateStr] YYYY-MM-DD date. Defaults to today in Bogota.
 * @returns {{ weekStart: string, weekEnd: string }}
 */
function getWeekDatesBogota(dateStr) {
  const targetStr = dateStr || getTodayBogota();
  const [year, month, day] = targetStr.split('-').map(Number);

  // Construct at local noon to avoid any edge-case near midnight
  const date = new Date(year, month - 1, day, 12, 0, 0);
  const dayOfWeek = date.getDay(); // 0=Sun … 6=Sat

  // Week starts on Saturday (6)
  const daysToLastSaturday = dayOfWeek === 6 ? 0 : dayOfWeek + 1;
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - daysToLastSaturday);

  // Week ends on Friday (6 days after Saturday)
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const fmt = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  };

  return { weekStart: fmt(weekStart), weekEnd: fmt(weekEnd) };
}

module.exports = { getTodayBogota, getWeekDatesBogota };
