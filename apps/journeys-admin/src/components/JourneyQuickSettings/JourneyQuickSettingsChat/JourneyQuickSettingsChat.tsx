import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { HostFormValues, useHostCreate } from '../../../libs/useHostCreate'
import { useHostUpdateMutation } from '../../../libs/useHostUpdateMutation'
import { Chat } from '../../Editor/Slider/Settings/CanvasDetails/JourneyAppearance/Chat'
import { HostAvatarsButton } from '../../Editor/Slider/Settings/CanvasDetails/JourneyAppearance/Host/HostForm/HostAvatarsButton'
import { HostTitleFieldForm } from '../../Editor/Slider/Settings/CanvasDetails/JourneyAppearance/Host/HostForm/HostTitleFieldForm'

interface JourneyQuickSettingsChatProps {
  displayName?: string
}

export function JourneyQuickSettingsChat({
  displayName
}: JourneyQuickSettingsChatProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const { updateHost } = useHostUpdateMutation()
  const createHost = useHostCreate()

  const initialValues: HostFormValues = {
    title: journey?.host == null ? (displayName ?? '') : journey.host.title
  }

  const [name, setName] = useState(initialValues.title)

  const handleNameChange = async (value: string): Promise<void> => {
    setName(value)
    if (journey?.host != null) {
      const { id, teamId } = journey.host
      await updateHost({ id, teamId, input: { title: value } })
    } else {
      await createHost({
        title: value
      })
    }
  }

  return (
    <Stack data-testid="JourneyQuickSettingsChat">
      <HostTitleFieldForm
        value={name}
        label={t('Your Name')}
        hostTitleRequiredErrorMessage={t('Please Enter Your Name')}
        onChange={handleNameChange}
      />
      <HostAvatarsButton />
      <Box sx={{ mx: -8 }}>
        <Chat />
      </Box>
    </Stack>
  )
}
