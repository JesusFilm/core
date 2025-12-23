import { MockedResponse } from '@apollo/client/testing'

import {
  GetParentJourneysFromTemplateId,
  GetParentJourneysFromTemplateIdVariables
} from '../../../__generated__/GetParentJourneysFromTemplateId'

import { GET_PARENT_JOURNEYS_FROM_TEMPLATE_ID } from './useGetParentTemplateJourneyLanguages'

export const mockParentVariables: GetParentJourneysFromTemplateIdVariables = {
  where: {
    template: true,
    ids: ['template-123']
  }
}

export const mockParentJourneys: MockedResponse<
  GetParentJourneysFromTemplateId,
  GetParentJourneysFromTemplateIdVariables
> = {
  request: {
    query: GET_PARENT_JOURNEYS_FROM_TEMPLATE_ID,
    variables: mockParentVariables
  },
  result: {
    data: {
      journeys: [
        {
          __typename: 'Journey' as const,
          id: 'parent-journey-1',
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
        }
      ]
    }
  }
}
