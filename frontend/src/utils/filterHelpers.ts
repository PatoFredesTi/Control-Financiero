export function getUniqueSortedValues(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ).sort((a, b) => a.localeCompare(b, 'es'));
}

export function isWithinDateRange(value: string, fromDate: string, toDate: string) {
  const dateKey = value.slice(0, 10);

  if (fromDate && dateKey < fromDate) {
    return false;
  }

  if (toDate && dateKey > toDate) {
    return false;
  }

  return true;
}

export function includesSearchTerm(searchTerm: string, values: Array<string | null | undefined>) {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  if (!normalizedSearchTerm) {
    return true;
  }

  return values.some((value) => value?.toLowerCase().includes(normalizedSearchTerm));
}
