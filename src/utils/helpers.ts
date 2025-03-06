export function mapToSelectOptions<T>(
  items: T[],
  keyField: keyof T,
  labelField: keyof T
): { key: string; label: string }[] {
  return items.map((item) => ({
    key: String(item[keyField]),
    label: String(item[labelField]),
  }));
}
