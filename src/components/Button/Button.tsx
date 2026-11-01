import type { ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router'
import { bem } from '@/lib/bem'
import { cx } from '@/lib/cx'
import styles from './Button.module.scss'

const b = bem(styles, 'button')

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md'

interface ButtonStyleProps {
  variant?: ButtonVariant
  size?: ButtonSize
}

/** Shared by <Button> and <ButtonLink> so both always look identical. */
function buttonClassName({ variant = 'primary', size = 'md' }: ButtonStyleProps, className?: string) {
  return cx(b(null, { [variant]: true, sm: size === 'sm' }), className)
}

/** Pill button. Defaults to `type="button"` so it never submits a form by accident. */
export function Button({
  variant,
  size,
  className,
  type = 'button',
  ...props
}: ButtonStyleProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={buttonClassName({ variant, size }, className)} {...props} />
}

/** Router link styled as a button: semantic navigation (an <a>), button looks. */
export function ButtonLink({ variant, size, className, ...props }: ButtonStyleProps & LinkProps) {
  return <Link className={buttonClassName({ variant, size }, className)} {...props} />
}
