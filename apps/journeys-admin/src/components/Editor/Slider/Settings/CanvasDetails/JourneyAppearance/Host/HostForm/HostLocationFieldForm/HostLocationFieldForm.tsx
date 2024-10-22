import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { useHostUpdateMutation } from '../../../../../../../../../libs/useHostUpdateMutation/useHostUpdateMutation'
import { TextFieldForm } from '../../../../../../../../TextFieldForm'

export function HostLocationFieldForm(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { updateHost } = useHostUpdateMutation()
  const { journey } = useJourney()

  async function handleSubmit(value: string): Promise<void> {
    if (journey?.host != null) {
      const { id, teamId } = journey.host
      await updateHost({ id, teamId, input: { location: value } })
    }
  }

  return (
    <TextFieldForm
      id="hostLocation"
      label={t('Location')}
      disabled={journey?.host == null}
      initialValue={
        journey?.host == null ? undefined : (journey.host.location ?? '')
      }
      onSubmit={handleSubmit}
      data-testid="HostLocationFieldForm"
    />
  )
}
