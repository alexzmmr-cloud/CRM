export function formValues<K extends string>(
  formData: FormData,
  keys: readonly K[],
): Record<K, string | undefined> {
  return Object.fromEntries(
    keys.map((key) => [key, formData.get(key) || undefined]),
  ) as Record<K, string | undefined>;
}
