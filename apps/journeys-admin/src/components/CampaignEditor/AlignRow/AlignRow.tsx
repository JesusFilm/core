import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { TypographyAlign } from '../../../../__generated__/globalTypes'
import { StyleRow } from '../StyleRow'

const ALIGNS = [
  TypographyAlign.left,
  TypographyAlign.center,
  TypographyAlign.right
] as const

interface AlignRowProps {
  /** The Extra's own alignment, or null when it follows the section. */
  value: TypographyAlign | null
  onChange: (align: TypographyAlign | null) => void
}

/** The Align row of a text or button Extra: left, center or right, or following the section. */
export function AlignRow({ value, onChange }: AlignRowProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const labels: Record<TypographyAlign, string> = {
    left: t('Left'),
    center: t('Center'),
    right: t('Right')
  }

  function handleReset(): void {
    onChange(null)
  }

  function handleChange(_event: unknown, align: TypographyAlign | null): void {
    if (align == null) return
    onChange(align)
  }

  return (
    <StyleRow
      label={t('Align')}
      inherited={value == null}
      onReset={handleReset}
    >
      <ToggleButtonGroup
        exclusive
        fullWidth
        size="small"
        value={value}
        onChange={handleChange}
        aria-label={t('Align')}
      >
        {ALIGNS.map((align) => (
          <ToggleButton key={align} value={align}>
            {labels[align]}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </StyleRow>
  )
}
