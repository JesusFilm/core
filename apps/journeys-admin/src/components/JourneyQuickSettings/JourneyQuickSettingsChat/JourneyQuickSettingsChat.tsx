import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { Chat } from '../../Editor/Slider/Settings/CanvasDetails/Footer/Chat'
import { HostAvatarsButton } from '../../Editor/Slider/Settings/CanvasDetails/Footer/HostTab/HostForm/HostAvatarsButton'
import { HostTitleFieldForm } from '../../Editor/Slider/Settings/CanvasDetails/Footer/HostTab/HostForm/HostTitleFieldForm'

export function JourneyQuickSettingsChat(): ReactElement {
  return (
    <>
      <HostTitleFieldForm />
      <HostAvatarsButton />
      <Box sx={{ mx: -8 }}>
        <Chat />
      </Box>
    </>
  )
}
