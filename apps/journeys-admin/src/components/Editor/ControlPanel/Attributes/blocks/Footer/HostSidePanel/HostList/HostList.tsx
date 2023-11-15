import { useMutation } from '@apollo/client'
import List from '@mui/material/List'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields_host as Host } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { UpdateJourneyHost } from '../../../../../../../../../__generated__/UpdateJourneyHost'
import { UPDATE_JOURNEY_HOST } from '../HostForm/HostTitleFieldForm/HostTitleFieldForm'
import { HostListItem } from '../HostListItem'

interface HostListProps {
  hosts: Host[]
  onItemClick: (hostId: string) => void
}

export function HostList({ hosts, onItemClick }: HostListProps): ReactElement {
  const { journey } = useJourney()

  const [journeyHostUpdate] =
    useMutation<UpdateJourneyHost>(UPDATE_JOURNEY_HOST)

  const handleClick = async (hostId: string): Promise<void> => {
    await onItemClick(hostId)

    if (journey != null) {
      await journeyHostUpdate({
        variables: { id: journey?.id, input: { hostId } }
      })
    }
  }

  return (
    <List disablePadding data-testid="HostList">
      {hosts.map((host) => (
        <HostListItem key={host.id} {...host} onClick={handleClick} />
      ))}
    </List>
  )
}
