/** Joins truthy class names: `cx(styles.card, isActive && styles.active)`. */
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
