import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { MAX_VALUE, MIN_VALUE, Position } from '../FocalPoint'

interface FocalPointInputsProps {
  localPosition: Position
  handleChange: (axis: 'x' | 'y', value: string) => void
}

export function FocalPointInputs({
  localPosition,
  handleChange
}: FocalPointInputsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
      {(['x', 'y'] as const).map((axis) => (
        <TextField
          key={axis}
          type="number"
          label={axis === 'x' ? t('Left') : t('Top')}
          value={localPosition[axis].toFixed(0)}
          onChange={(e) => handleChange(axis, e.target.value)}
          slotProps={{
            input: { endAdornment: '%' },
            htmlInput: { min: MIN_VALUE, max: MAX_VALUE }
          }}
          sx={{ width: '45%' }}
        />
      ))}
    </Box>
  )
}
