/** Joins class names, skipping falsy values. Keeps conditional Tailwind classes readable. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
