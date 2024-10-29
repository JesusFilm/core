import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { ReactElement, useCallback, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { useHostCreateMutation } from '../../../libs/useHostCreateMutation'
import { useHostUpdateMutation } from '../../../libs/useHostUpdateMutation'
import { useUpdateJourneyHostMutation } from '../../../libs/useUpdateJourneyHostMutation'
import { Chat } from '../../Editor/Slider/Settings/CanvasDetails/JourneyAppearance/Chat'
import { HostAvatarsButton } from '../../Editor/Slider/Settings/CanvasDetails/JourneyAppearance/Host/HostForm/HostAvatarsButton'
import { HostTitleFieldForm } from '../../Editor/Slider/Settings/CanvasDetails/JourneyAppearance/Host/HostForm/HostTitleFieldForm'

interface JourneyQuickSettingsChatProps {
  displayName?: string
}

interface HostFormValues {
  title: string
}

export function JourneyQuickSettingsChat({
  displayName
}: JourneyQuickSettingsChatProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const { updateHost } = useHostUpdateMutation()
  const [hostCreate] = useHostCreateMutation()
  const [journeyHostUpdate] = useUpdateJourneyHostMutation()

  const initialValues: HostFormValues = {
    title: displayName ?? ''
  }

  const [name, setName] = useState(initialValues.title)

  // TODO(jk): this is repeated in HostForm
  const createHost = useCallback(
    async (values: HostFormValues): Promise<void> => {
      if (journey?.team != null) {
        const { data } = await hostCreate({
          variables: { teamId: journey.team.id, input: values }
        })
        if (data?.hostCreate.id != null) {
          await journeyHostUpdate({
            variables: {
              id: journey?.id,
              input: { hostId: data.hostCreate.id }
            }
          })
        }
      }
    },
    [hostCreate, journey, journeyHostUpdate]
  )

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
    <>
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
    </>
  )
}
