import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { ReactElement } from 'react'

import { noop } from 'lodash'
import { ImageUpload } from '../../../../../../apps/journeys-admin/src/components/Editor/Slider/Settings/Drawer/ImageBlockEditor/CustomImage/ImageUpload'

import { Chat } from '../../../../../../apps/journeys-admin/src/components/Editor/Slider/Settings/CanvasDetails/Footer/Chat'

import { HostTitleFieldForm } from '../../../../../../apps/journeys-admin/src/components/Editor/Slider/Settings/CanvasDetails/Footer/HostTab/HostForm/HostTitleFieldForm'
import { PreviewItem } from '../../../../../../apps/journeys-admin/src/components/Editor/Toolbar/Items/PreviewItem'

import { ShareButton } from 'libs/journeys/ui/src/components/StepFooter/FooterButtonList/ShareButton'

export function JourneysQuickPage(): ReactElement {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3"> Journeys Form Page</Typography>

      <HostTitleFieldForm />

      {/* Use imageblock on journey?  */}
      <Typography variant="h4">Your Profile Image: </Typography>

      <ImageUpload selectedBlock={null} onChange={noop} />
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
