import CheckIcon from '@mui/icons-material/Check'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { QualityOption } from '../types'

export interface QualityMenuItemsProps {
  qualities: QualityOption[]
  currentQuality: string
  autoMode: boolean
  onQualityChange: (height: number | 'auto') => void
}

export function QualityMenuItems({
  qualities,
  currentQuality,
  autoMode,
  onQualityChange
}: QualityMenuItemsProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')

  return (
    <>
      <MenuItem
        onClick={() => onQualityChange('auto')}
        sx={{ display: 'flex', justifyContent: 'space-between' }}
      >
        <Typography>{t('Auto')}</Typography>
        {autoMode && <CheckIcon fontSize="small" />}
      </MenuItem>
      {qualities.map((quality) => (
        <MenuItem
          key={`${quality.height}-${quality.bitrate}`}
          onClick={() => onQualityChange(quality.height)}
          sx={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <Typography>{quality.label}</Typography>
          {!autoMode && currentQuality === quality.label && (
            <CheckIcon fontSize="small" />
          )}
        </MenuItem>
      ))}
    </>
  )
}
