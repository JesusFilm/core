import {
  JourneyFields_host as Host,
  JourneyFields as Journey
} from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

export const defaultHost: Host = {
  id: 'hostId',
  __typename: 'Host',
  teamId: 'team.id',
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
  team: { id: 'team.id' }
} as unknown as Journey
