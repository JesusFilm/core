import List from '@mui/material/List'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { GetAllTeamHosts_hosts as Host } from '../../../../../../../../../__generated__/GetAllTeamHosts'
import { useUpdateJourneyHostMutation } from '../../../../../../../../libs/useUpdateJourneyHostMutation'
import { HostListItem } from '../HostListItem'

interface HostListProps {
  hosts: Host[]
  onItemClick: (hostId: string) => void
}

export function HostList({ hosts, onItemClick }: HostListProps): ReactElement {
  const { journey } = useJourney()

  const [journeyHostUpdate] = useUpdateJourneyHostMutation()

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
