import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { ReactElement } from 'react'

import { Chat } from '../Editor/Slider/Settings/CanvasDetails/Footer/Chat'

import { HostTitleFieldForm } from '../Editor/Slider/Settings/CanvasDetails/Footer/HostTab/HostForm/HostTitleFieldForm'
import { PreviewItem } from '../Editor/Toolbar/Items/PreviewItem'

import { ShareButton } from 'libs/journeys/ui/src/components/StepFooter/FooterButtonList/ShareButton'
import { HostAvatarsButton } from '../Editor/Slider/Settings/CanvasDetails/Footer/HostTab/HostForm/HostAvatarsButton'

export function JourneyQuickSettings(): ReactElement {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3"> Journeys Form Page</Typography>

      <HostTitleFieldForm />

      <Typography variant="h4">Your Profile Image: </Typography>

      <HostAvatarsButton />
      <Typography variant="h4"> Social media link: </Typography>
      <Box sx={{ p: 4 }}>
        <Chat />
      </Box>

      <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <PreviewItem variant="button" />
        <ShareButton />
      </Stack>
    </Box>
  )
}
