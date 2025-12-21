import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'

import { IdType } from '../../../../../__generated__/globalTypes'
import {
  GetTemplateFamilyStatsAggregate,
  GetTemplateFamilyStatsAggregateVariables
} from '../../../../../__generated__/GetTemplateFamilyStatsAggregate'

import {
  GET_TEMPLATE_FAMILY_STATS_AGGREGATE,
  TemplateAggregateAnalytics
} from './TemplateAggregateAnalytics'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' }
  })
}))

describe('TemplateAggregateAnalytics', () => {
  it('should render icons for each metric button', async () => {
    render(
      <MockedProvider>
        <TemplateAggregateAnalytics journeyId={'journeyId'} />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('Data1Icon')).toBeInTheDocument()
      expect(screen.getByTestId('EyeOpenIcon')).toBeInTheDocument()
      expect(screen.getByTestId('Inbox2Icon')).toBeInTheDocument()
    })
  })

  it('should call the query with correct variables and types', async () => {
    const templateFamilyStatsAggregateMock: MockedResponse<
      GetTemplateFamilyStatsAggregate,
      GetTemplateFamilyStatsAggregateVariables
    > = {
      request: {
        query: GET_TEMPLATE_FAMILY_STATS_AGGREGATE,
        variables: {
          id: 'journeyId',
          idType: IdType.databaseId,
          where: {}
        }
      },
      result: jest.fn(() => ({
        data: {
          templateFamilyStatsAggregate: {
            __typename: 'TemplateFamilyStatsAggregateResponse',
            childJourneysCount: 10,
            totalJourneysViews: 100,
            totalJourneysResponses: 50
          }
        }
      }))
    }

    render(
      <MockedProvider mocks={[templateFamilyStatsAggregateMock]}>
        <TemplateAggregateAnalytics journeyId={'journeyId'} />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(templateFamilyStatsAggregateMock.result).toHaveBeenCalledWith({
        id: 'journeyId',
        idType: IdType.databaseId,
        where: {}
      })
    })
  })
})
