import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, ReactNode } from 'react'

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
