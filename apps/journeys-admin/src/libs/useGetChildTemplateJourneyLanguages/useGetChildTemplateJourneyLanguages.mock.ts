import { MockLink } from '@apollo/client/testing'

import {
  GetChildJourneysFromTemplateId,
  GetChildJourneysFromTemplateIdVariables
} from '../../../__generated__/GetChildJourneysFromTemplateId'

import { GET_CHILD_JOURNEYS_FROM_TEMPLATE_ID } from './useGetChildTemplateJourneyLanguages'

export const mockChildVariables: GetChildJourneysFromTemplateIdVariables = {
  where: {
    template: true,
    fromTemplateId: 'journeyId'
  }
}

export const mockChildJourneys: MockLink.MockedResponse<
  GetChildJourneysFromTemplateId,
  GetChildJourneysFromTemplateIdVariables
> = {
  request: {
    query: GET_CHILD_JOURNEYS_FROM_TEMPLATE_ID,
    variables: mockChildVariables
  },
  result: {
    data: {
      journeys: [
        {
          __typename: 'Journey' as const,
          id: 'journey-1',
          fromTemplateId: 'journeyId',
          language: {
            __typename: 'Language' as const,
            id: 'language-1',
            slug: 'en',
            name: [
              {
                __typename: 'LanguageName' as const,
                primary: true,
                value: 'English'
              }
            ]
          }
        },
        {
          __typename: 'Journey' as const,
          id: 'journey-2',
          fromTemplateId: 'journeyId',
          language: {
            __typename: 'Language' as const,
            id: 'language-2',
            slug: 'es',
            name: [
              {
                __typename: 'LanguageName' as const,
                primary: true,
                value: 'Spanish'
              }
            ]
          }
        }
      ]
    }
  }
}
