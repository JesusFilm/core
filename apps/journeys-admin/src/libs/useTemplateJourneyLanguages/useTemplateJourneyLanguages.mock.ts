import { MockedResponse } from '@apollo/client/testing'

import {
  GetJourneysFromTemplateId,
  GetJourneysFromTemplateIdVariables
} from '../../../__generated__/GetJourneysFromTemplateId'

import { GET_JOURNEYS_FROM_TEMPLATE_ID } from './useTemplateJourneyLanguages'

export const mockVariables: GetJourneysFromTemplateIdVariables = {
  where: {
    template: true,
    ids: ['template-123']
  }
}

export const mockJourneys: MockedResponse<
  GetJourneysFromTemplateId,
  GetJourneysFromTemplateIdVariables
> = {
  request: {
    query: GET_JOURNEYS_FROM_TEMPLATE_ID,
    variables: mockVariables
  },
  result: {
    data: {
      journeys: [
        {
          __typename: 'Journey' as const,
          id: 'journey-1',
          fromTemplateId: 'template-123',
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
          fromTemplateId: 'template-123',
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
        },
        {
          __typename: 'Journey' as const,
          id: 'journey-3',
          fromTemplateId: 'template-123',
          language: {
            __typename: 'Language' as const,
            id: 'language-3',
            slug: 'fr',
            name: [
              {
                __typename: 'LanguageName' as const,
                primary: true,
                value: 'French'
              }
            ]
          }
        }
      ]
    }
  }
}
