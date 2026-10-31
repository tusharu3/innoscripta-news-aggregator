import type { SVGProps } from 'react'

// Small inline icon set (24px grid, stroke = currentColor) — no icon library needed for five glyphs.
function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    />
  )
}

export const FeedIcon = () => (
  <Icon>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M7 8h10M7 12h10M7 16h6" />
  </Icon>
)

export const SearchIcon = () => (
  <Icon>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
)

export const SlidersIcon = () => (
  <Icon>
    <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="10" cy="12" r="2" />
    <circle cx="18" cy="18" r="2" />
  </Icon>
)

export const FilterIcon = () => (
  <Icon>
    <path d="M4 5h16l-6 8v5l-4 2v-7z" />
  </Icon>
)

export const CheckIcon = () => (
  <Icon width="14" height="14" strokeWidth="2.4">
    <path d="m5 12 5 5 9-10" />
  </Icon>
)
