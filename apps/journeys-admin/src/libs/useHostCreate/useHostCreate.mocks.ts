import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { GetAllTeamHosts_hosts as Host } from '../../../__generated__/GetAllTeamHosts'

export const defaultHost: Host = {
  id: 'hostId',
  __typename: 'Host',
  title: 'Cru International',
  location: 'Florida, USA',
  src1: 'imageSrc1',
  src2: 'imageSrc2'
}

export const journey = {
  __typename: 'Journey',
  id: 'journeyId',
  seoTitle: 'My awesome journey',
  host: defaultHost,
  team: { id: 'teamId' }
} as unknown as Journey
