import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { ReactElement } from 'react'
import { useHostUpdate } from '../../../../../../../../libs/useHostUpdate/useHostUpdate'
import { TextFieldForm } from '../../../../../../../TextFieldForm'

export function HostLocationFieldForm(): ReactElement {
  const { updateHost } = useHostUpdate()
  const { journey } = useJourney()
  const host = journey?.host

  async function handleSubmit(value: string): Promise<void> {
    if (host != null) {
      const { id, teamId } = host
      await updateHost({ id, teamId, input: { location: value } })
    }
  }

  return (
    <TextFieldForm
      id="hostLocation"
      label="Location"
      initialValue={host?.location ?? ''}
      onSubmit={handleSubmit}
    />
  )
}
