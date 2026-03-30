/**
 * iCal (RFC 5545) generator and parser for RentPro
 * No external dependencies — hand-rolled for simplicity
 */

export interface ICalEvent {
  uid: string;
  summary: string;
  dateFrom: string; // "YYYY-MM-DD"
  dateTo: string;   // "YYYY-MM-DD", exclusive (checkout day)
  description?: string;
}

/** Convert "YYYY-MM-DD" to iCal VALUE=DATE format "YYYYMMDD" */
function toICalDate(date: string): string {
  return date.replace(/-/g, "");
}

/** Fold long lines at 75 octets per RFC 5545 */
function foldLine(line: string): string {
  const maxLen = 75;
  if (line.length <= maxLen) return line;
  let result = line.substring(0, maxLen);
  let i = maxLen;
  while (i < line.length) {
    result += "\r\n " + line.substring(i, i + maxLen - 1);
    i += maxLen - 1;
  }
  return result;
}

/**
 * Generate an iCalendar (.ics) string from events
 */
export function generateICS(
  events: ICalEvent[],
  calendarName: string = "RentPro"
): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RentPro//RentPro//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    foldLine(`X-WR-CALNAME:${calendarName}`),
  ];

  for (const event of events) {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${event.uid}@rentpro`);
    lines.push(`DTSTART;VALUE=DATE:${toICalDate(event.dateFrom)}`);
    lines.push(`DTEND;VALUE=DATE:${toICalDate(event.dateTo)}`);
    lines.push(foldLine(`SUMMARY:${event.summary}`));
    if (event.description) {
      lines.push(foldLine(`DESCRIPTION:${event.description}`));
    }
    lines.push("STATUS:CONFIRMED");
    lines.push("TRANSP:OPAQUE");
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

/**
 * Parse an iCalendar (.ics) string into events
 */
export function parseICS(text: string): ICalEvent[] {
  // Normalize line endings and unfold continuation lines
  const raw = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const unfolded = raw.replace(/\n[ \t]/g, "");
  const lines = unfolded.split("\n");

  const events: ICalEvent[] = [];
  let inEvent = false;
  let current: Partial<ICalEvent> = {};

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "BEGIN:VEVENT") {
      inEvent = true;
      current = {};
      continue;
    }

    if (trimmed === "END:VEVENT") {
      inEvent = false;
      if (current.uid && current.dateFrom && current.dateTo) {
        events.push({
          uid: current.uid,
          summary: current.summary || "Blocked",
          dateFrom: current.dateFrom,
          dateTo: current.dateTo,
          description: current.description,
        });
      }
      continue;
    }

    if (!inEvent) continue;

    // Parse UID
    if (trimmed.startsWith("UID:")) {
      current.uid = trimmed.substring(4);
    }

    // Parse SUMMARY
    if (trimmed.startsWith("SUMMARY:")) {
      current.summary = trimmed.substring(8);
    }

    // Parse DESCRIPTION
    if (trimmed.startsWith("DESCRIPTION:")) {
      current.description = trimmed.substring(12);
    }

    // Parse DTSTART — handle both VALUE=DATE and datetime formats
    if (trimmed.startsWith("DTSTART")) {
      current.dateFrom = extractDate(trimmed);
    }

    // Parse DTEND
    if (trimmed.startsWith("DTEND")) {
      current.dateTo = extractDate(trimmed);
    }

    // Parse DURATION (fallback if DTEND is absent)
    if (trimmed.startsWith("DURATION:") && current.dateFrom && !current.dateTo) {
      const days = parseDuration(trimmed.substring(9));
      if (days > 0) {
        current.dateTo = addDays(current.dateFrom, days);
      }
    }
  }

  return events;
}

/**
 * Extract date from an iCal date line, handling:
 * - DTSTART;VALUE=DATE:20260329
 * - DTSTART:20260329T000000Z
 * - DTSTART;TZID=Asia/Almaty:20260329T140000
 */
function extractDate(line: string): string | undefined {
  const colonIdx = line.lastIndexOf(":");
  if (colonIdx < 0) return undefined;
  const value = line.substring(colonIdx + 1).trim();

  // Remove time part if present
  const dateStr = value.replace(/T.*$/, "");

  if (dateStr.length !== 8 || !/^\d{8}$/.test(dateStr)) return undefined;

  // Convert YYYYMMDD → YYYY-MM-DD
  return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
}

/** Parse ISO 8601 duration like P2D → 2 (days) */
function parseDuration(dur: string): number {
  const match = dur.match(/P(\d+)D/);
  return match ? parseInt(match[1], 10) : 0;
}

/** Add days to a "YYYY-MM-DD" string */
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}
