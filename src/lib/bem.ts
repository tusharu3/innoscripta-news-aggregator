type Modifiers = Record<string, boolean | undefined>

/**
 * BEM class-name builder for CSS Modules.
 *
 *   const b = bem(styles, 'article-card')
 *   b()                          → 'article-card'
 *   b('title')                   → 'article-card__title'
 *   b('link', { active: true })  → 'article-card__link article-card__link--active'
 *
 * Returns the module's scoped (hashed) names, so SCSS stays readable BEM
 * while class names can never collide between components.
 */
export function bem(styles: CSSModuleClasses, block: string) {
  return (element?: string | null, modifiers?: Modifiers): string => {
    const base = element ? `${block}__${element}` : block
    const classes = [styles[base]]
    if (modifiers) {
      for (const name in modifiers) {
        if (modifiers[name]) classes.push(styles[`${base}--${name}`])
      }
    }
    return classes.filter(Boolean).join(' ')
  }
}
