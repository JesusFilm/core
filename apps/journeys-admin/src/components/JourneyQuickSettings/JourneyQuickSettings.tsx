import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { Chat } from '../Editor/Slider/Settings/CanvasDetails/Footer/Chat'

import { HostTitleFieldForm } from '../Editor/Slider/Settings/CanvasDetails/Footer/HostTab/HostForm/HostTitleFieldForm'
import { PreviewItem } from '../Editor/Toolbar/Items/PreviewItem'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { ShareDialog } from '@core/journeys/ui/StepFooter/FooterButtonList/ShareButton/ShareDialog'
import ShareIcon from '@core/shared/ui/icons/Share'
import { HostAvatarsButton } from '../Editor/Slider/Settings/CanvasDetails/Footer/HostTab/HostForm/HostAvatarsButton'
import { Item } from '../Editor/Toolbar/Items/Item'

export function JourneyQuickSettings(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  const url =
    typeof window !== 'undefined' && journey?.slug != null
      ? window.location.href
      : undefined
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3"> {t('Journeys Form Page')}</Typography>

      <HostTitleFieldForm />

      <Typography variant="h4">{t('Your Profile Image:')} </Typography>

      <HostAvatarsButton />
      <Typography variant="h4"> {t('Social media link:')} </Typography>
      <Box sx={{ p: 4 }}>
        <Chat />
      </Box>

      <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <PreviewItem variant="button" />
        <Item
          variant="button"
          label={t('Share')}
          icon={<ShareIcon />}
          onClick={() => setShareDialogOpen(true)}
          ButtonProps={{
            variant: 'contained'
          }}
        />
        <ShareDialog
          url={url}
          open={shareDialogOpen}
          closeDialog={() => setShareDialogOpen(false)}
        />
      </Stack>
    </Box>
  )
}
