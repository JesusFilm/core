import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { Chat } from '../../Editor/Slider/Settings/CanvasDetails/Footer/Chat'
import { HostAvatarsButton } from '../../Editor/Slider/Settings/CanvasDetails/Footer/Host/HostForm/HostAvatarsButton'
import { HostTitleFieldForm } from '../../Editor/Slider/Settings/CanvasDetails/Footer/Host/HostForm/HostTitleFieldForm'

interface JourneyQuickSettingsChatProps {
  displayName?: string
}

export function JourneyQuickSettingsChat({
  displayName
}: JourneyQuickSettingsChatProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <>
      <HostTitleFieldForm
        defaultTitle={displayName}
        label={t('Your Name')}
        hostTitleRequiredErrorMessage={t('Please Enter Your Name')}
      />
      <HostAvatarsButton />
      <Box sx={{ mx: -8 }}>
        <Chat />
      </Box>
    </>
  )
}
