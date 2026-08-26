import { Theme } from '@mui/material/styles'

export interface PollOptionBorderColors {
  default: string
  hover: string
  active: string
  disabled: string
}

const LIGHT_BORDER_COLORS: PollOptionBorderColors = {
  default: 'rgba(225, 225, 225, 0.3)',
  hover: 'rgba(255, 255, 255, 0.5)',
  active: 'rgba(255, 255, 255, 0.7)',
  disabled: 'rgba(255, 255, 255, 0.15)'
}

const DARK_BORDER_COLORS: PollOptionBorderColors = {
  default: 'rgba(150, 150, 150, 0.2)',
  hover: 'rgba(150, 150, 150, 0.5)',
  active: 'rgba(150, 150, 150, 0.7)',
  disabled: 'rgba(150, 150, 150, 0.15)'
}

/**
 * Poll option border colours, one per interaction state.
 *
 * Callers apply each colour to whichever selector they need. Pair `hover` with
 * `hoverOnly()` so it only paints on devices with a real pointer — this util
 * deliberately returns no selector keys of its own, so there is only ever one
 * `@media (hover: hover)` block per style object to merge.
 */
export const getPollOptionBorderColors = (
  theme: Theme,
  options?: { important?: boolean }
): PollOptionBorderColors => {
  const colors =
    theme.palette.mode === 'dark' ? DARK_BORDER_COLORS : LIGHT_BORDER_COLORS
  const suffix = options?.important === true ? ' !important' : ''

  return {
    default: `${colors.default}${suffix}`,
    hover: `${colors.hover}${suffix}`,
    active: `${colors.active}${suffix}`,
    disabled: `${colors.disabled}${suffix}`
  }
}

/**
 * Base (unselected, un-hovered) border styles for a poll option.
 *
 * State colours are not included — take them from `getPollOptionBorderColors`.
 */
export const getPollOptionBorderStyles = (
  theme: Theme,
  options?: { important?: boolean }
) => {
  const suffix = options?.important === true ? ' !important' : ''

  return {
    borderColor: getPollOptionBorderColors(theme, options).default,
    borderWidth: `1px${suffix}`,
    borderStyle: `solid${suffix}`
  }
}
