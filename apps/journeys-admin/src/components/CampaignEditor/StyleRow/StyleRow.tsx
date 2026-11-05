import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, ReactNode } from 'react'

import { TypographyAlign } from '../../../../__generated__/globalTypes'
import { ValueIndicator } from '../ValueIndicator'

interface StyleRowProps {
  label: string
  /** Set for a row whose value may follow the section: the dot and, once set, Reset. */
  inherited?: boolean
  /** Writes null; offered while the row holds a value of its own. */
  onReset?: () => void
  children: ReactNode
}

/**
 * One inline row of the Style tab: its label, the inherited-or-set dot when
 * the value may follow the section, a Reset that writes null, and the control.
 */
export function StyleRow({
  label,
  inherited,
  onReset,
  children
}: StyleRowProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Stack spacing={1} data-testid={`StyleRow-${label}`}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Typography variant="subtitle2">{label}</Typography>
        {inherited != null && (
          <ValueIndicator source={inherited ? 'inherited' : 'set'} />
        )}
        {onReset != null && (
          <Button
            size="small"
            color="secondary"
            disabled={inherited === true}
            onClick={onReset}
            aria-label={t('Reset {{label}}', { label })}
            sx={{ ml: 'auto' }}
          >
            {t('Reset')}
          </Button>
        )}
      </Stack>
      {children}
    </Stack>
  )
}

export const ALIGNS = [
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

  function handleChange(_event: unknown, align: TypographyAlign | null): void {
    if (align == null) return
    onChange(align)
  }

  return (
    <StyleRow
      label={t('Align')}
      inherited={value == null}
      onReset={() => onChange(null)}
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
