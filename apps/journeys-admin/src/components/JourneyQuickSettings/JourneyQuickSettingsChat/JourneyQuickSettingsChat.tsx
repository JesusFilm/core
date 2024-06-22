import Box from '@mui/material/Box'
import { useUser } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { Chat } from '../../Editor/Slider/Settings/CanvasDetails/Footer/Chat'
import { HostAvatarsButton } from '../../Editor/Slider/Settings/CanvasDetails/Footer/HostTab/HostForm/HostAvatarsButton'
import { HostTitleFieldForm } from '../../Editor/Slider/Settings/CanvasDetails/Footer/HostTab/HostForm/HostTitleFieldForm'

export function JourneyQuickSettingsChat(): ReactElement {
  const { displayName } = useUser()
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <>
      <HostTitleFieldForm
        defaultTitle={displayName ?? undefined}
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
