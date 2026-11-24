import { TypographyAlign } from '../../../../../__generated__/globalTypes'

/** The flex `align-items` / `justify-content` value that lines up with a text alignment; start for null. */
export function flexAlign(align: TypographyAlign | null): string {
  if (align === TypographyAlign.center) return 'center'
  if (align === TypographyAlign.right) return 'flex-end'
  return 'flex-start'
}
