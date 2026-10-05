import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import PaletteIcon from '@core/shared/ui/icons/Palette'
import Plus2Icon from '@core/shared/ui/icons/Plus2'
import SettingsIcon from '@core/shared/ui/icons/Settings'
import TranslateIcon from '@core/shared/ui/icons/Translate'

interface BottomBarProps {
  onSettingsClick: () => void
}

/**
 * The campaign row: the contextual bottom bar shown while nothing on the
 * canvas is selected. Theme, Translations and Add section open in their own
 * tickets and stay inert here.
 */
export function BottomBar({ onSettingsClick }: BottomBarProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Stack
      direction="row"
      spacing={2}
      data-testid="CampaignBottomBar"
      sx={{
        px: 4,
        py: 2,
        alignItems: 'center',
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}
    >
      <Button
        variant="outlined"
        color="secondary"
        startIcon={<SettingsIcon />}
        onClick={onSettingsClick}
      >
        {t('Settings')}
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        startIcon={<PaletteIcon />}
        disabled
      >
        {t('Theme')}
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        startIcon={<TranslateIcon />}
        disabled
      >
        {t('Translations')}
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        startIcon={<Plus2Icon />}
        disabled
      >
        {t('Add section')}
      </Button>
    </Stack>
  )
}
