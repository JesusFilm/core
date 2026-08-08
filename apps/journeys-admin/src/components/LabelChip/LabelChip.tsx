import Chip from '@mui/material/Chip'
import { SxProps, Theme } from '@mui/material/styles'
import { ReactElement } from 'react'

import { THAI_FALLBACK_FONT } from '@core/shared/ui/themes'

export type LabelChipColor = 'default' | 'success'

interface LabelChipProps {
  label: string
  /**
   * 'default' renders the neutral grey label used for TEMPLATE, DRAFT,
   * EMPTY and RECOMMENDED. 'success' renders the green LIVE label.
   */
  color?: LabelChipColor
  sx?: SxProps<Theme>
  'data-testid'?: string
}

/**
 * Shared status/label chip (NES-1696). A filled, squareish, uppercase chip
 * standardised across the editor (TEMPLATE), collection cards (LIVE / DRAFT /
 * EMPTY) and the template info panel (RECOMMENDED) so the labels stay
 * visually consistent. Pass `color="success"` for the green LIVE state.
 */
export function LabelChip({
  label,
  color = 'default',
  sx,
  'data-testid': dataTestId
}: LabelChipProps): ReactElement {
  const isSuccess = color === 'success'
  return (
    <Chip
      label={label}
      data-testid={dataTestId}
      sx={[
        {
          height: 28,
          borderRadius: '4px',
          bgcolor: isSuccess ? 'success.main' : 'divider',
          color: isSuccess ? 'success.contrastText' : 'text.primary',
          fontFamily: `"Open Sans", ${THAI_FALLBACK_FONT}, sans-serif`,
          fontSize: 14,
          fontWeight: 600,
          lineHeight: '20px',
          textTransform: 'uppercase',
          px: 2,
          py: 1,
          '& .MuiChip-label': { px: 0, py: 0 }
        },
        ...(Array.isArray(sx) ? sx : [sx])
      ]}
    />
  )
}
