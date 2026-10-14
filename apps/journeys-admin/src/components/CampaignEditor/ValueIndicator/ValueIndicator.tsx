import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

/** Where a value comes from: the band or theme above the block, or the block itself. */
export type ValueSource = 'inherited' | 'set'

interface ValueIndicatorProps {
  source: ValueSource
}

/**
 * The dot beside a style value: orange when the block inherits it from its
 * band or the theme, blue when it is set on the block itself.
 */
export function ValueIndicator({ source }: ValueIndicatorProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Box
      role="img"
      aria-label={source === 'set' ? t('Set') : t('Inherited')}
      data-testid="ValueIndicator"
      data-source={source}
      sx={{
        width: 8,
        height: 8,
        flexShrink: 0,
        borderRadius: '50%',
        bgcolor: source === 'set' ? 'info.main' : 'warning.main'
      }}
    />
  )
}
