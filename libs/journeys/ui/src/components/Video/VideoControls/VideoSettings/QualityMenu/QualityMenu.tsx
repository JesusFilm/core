import ArrowBackIosNewRounded from '@mui/icons-material/ArrowBackIosNewRounded'
import CheckIcon from '@mui/icons-material/Check'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

export interface QualityMenuItem {
  resolution: string
  qualityLevel: number
}

interface QualityMenuProps {
  anchorEl: HTMLElement | null
  open: boolean
  onClose: () => void
  onBack: () => void
  qualities: QualityMenuItem[]
  selectedQuality: number | null
  onQualityChange: (quality: number) => void
}

export function QualityMenu({
  anchorEl,
  open,
  onClose,
  onBack,
  qualities,
  selectedQuality,
  onQualityChange
}: QualityMenuProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')

  return (
    <Menu
      id="quality-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'right'
      }}
    >
      <MenuItem onClick={onBack} sx={{ minWidth: 200 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <ArrowBackIosNewRounded fontSize="small" />
          <Typography>{t('Quality')}</Typography>
        </Stack>
      </MenuItem>
      {qualities.map(({ resolution, qualityLevel }) => (
        <MenuItem
          key={qualityLevel}
          onClick={() => {
            onQualityChange(qualityLevel)
            onClose()
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1
          }}
        >
          <Typography>{resolution}</Typography>
          {selectedQuality === qualityLevel && <CheckIcon fontSize="small" />}
        </MenuItem>
      ))}
    </Menu>
  )
}
