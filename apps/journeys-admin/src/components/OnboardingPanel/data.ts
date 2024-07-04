import { MockedResponse } from '@apollo/client/testing'

import { GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS } from '@core/journeys/ui/TeamProvider'
import { GetLastActiveTeamIdAndTeams } from '@core/journeys/ui/TeamProvider/__generated__/GetLastActiveTeamIdAndTeams'

import {
  GetOnboardingJourneys,
  GetOnboardingJourneysVariables,
  GetOnboardingJourneys_onboardingJourneys as OnboardingJourneys
} from '../../../__generated__/GetOnboardingJourneys'

import {
  GET_ONBOARDING_JOURNEYS,
  ONBOARDING_IDS
} from './OnboardingList/OnboardingList'

export const onboardingJourneys: OnboardingJourneys[] = [
  {
    __typename: 'Journey',
    id: '014c7add-288b-4f84-ac85-ccefef7a07d3',
    title: 'template 1 title',
    description: 'template 1 description',
    template: true,
    primaryImageBlock: {
      __typename: 'ImageBlock',
      src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public'
    }
  },
  {
    __typename: 'Journey',
    id: 'c4889bb1-49ac-41c9-8fdb-0297afb32cd9',
    title: 'template 2 title',
    description: 'template 2 description',
    template: true,
    primaryImageBlock: {
      __typename: 'ImageBlock',
      src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public'
    }
  },
  {
    __typename: 'Journey',
    id: 'e978adb4-e4d8-42ef-89a9-79811f10b7e9',
    title: 'template 3 title',
    description: 'template 3 description',
    template: true,
    primaryImageBlock: {
      __typename: 'ImageBlock',
      src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public'
    }
  },
  {
    __typename: 'Journey',
    id: '178c01bd-371c-4e73-a9b8-e2bb95215fd8',
    title: 'template 4 title',
    description: 'template 4 description',
    template: true,
    primaryImageBlock: {
      __typename: 'ImageBlock',
      src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public'
    }
  },
  {
    __typename: 'Journey',
    id: '13317d05-a805-4b3c-b362-9018971d9b57',
    title: 'template 5 title',
    description: 'template 5 description',
    template: true,
    primaryImageBlock: {
      __typename: 'ImageBlock',
      src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public'
    }
  }
]

export const getTeamsMock: MockedResponse<GetLastActiveTeamIdAndTeams> = {
  request: {
    query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
  },
  result: {
    data: {
      teams: [
        {
          id: 'teamId',
          title: 'Team Title',
          __typename: 'Team',
          publicTitle: 'Public Team Title',
          userTeams: [],
          customDomains: []
        }
      ],
      getJourneyProfile: {
        __typename: 'JourneyProfile',
        id: 'journeyProfileId',
        lastActiveTeamId: 'teamId'
      }
    }
  }
}

export const getOnboardingJourneysMock: MockedResponse<
  GetOnboardingJourneys,
  GetOnboardingJourneysVariables
> = {
  request: {
    query: GET_ONBOARDING_JOURNEYS,
    variables: {
      where: {
        ids: ONBOARDING_IDS
      }
    }
  },
  result: {
    data: { onboardingJourneys }
  }
}
