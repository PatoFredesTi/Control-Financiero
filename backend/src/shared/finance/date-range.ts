export interface MonthDateRange {
  start: Date;
  end: Date;
}

export function getMonthDateRange(month: number, year: number): MonthDateRange {
  if (month < 1 || month > 12) {
    throw new Error('El mes debe estar entre 1 y 12.');
  }

  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

  return { start, end };
}

export function isDateWithinRange(date: Date, range: MonthDateRange): boolean {
  return date >= range.start && date < range.end;
}
