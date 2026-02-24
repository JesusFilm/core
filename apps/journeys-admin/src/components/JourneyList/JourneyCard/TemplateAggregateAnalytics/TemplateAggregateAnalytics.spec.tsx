import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'

import {
  GetTemplateFamilyStatsAggregate,
  GetTemplateFamilyStatsAggregateVariables
} from '../../../../../__generated__/GetTemplateFamilyStatsAggregate'
import { IdType } from '../../../../../__generated__/globalTypes'
import { GET_TEMPLATE_FAMILY_STATS_AGGREGATE } from '../../../../libs/useTemplateFamilyStatsAggregateLazyQuery'

import { TemplateAggregateAnalytics } from './TemplateAggregateAnalytics'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' }
  })
}))

const mockEnqueueSnackbar = jest.fn()

jest.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: mockEnqueueSnackbar
  })
}))

describe('TemplateAggregateAnalytics', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

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

    await waitFor(() =>
      expect(templateFamilyStatsAggregateMock.result).toHaveBeenCalled()
    )

    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
  })

  it('should show error snackbar when query fails', async () => {
    const templateFamilyStatsAggregateErrorMock: MockedResponse<
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
      error: new Error('Failed to fetch template stats')
    }

    render(
      <MockedProvider mocks={[templateFamilyStatsAggregateErrorMock]}>
        <TemplateAggregateAnalytics journeyId={'journeyId'} />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'Failed to load template analytics',
        {
          variant: 'error',
          preventDuplicate: true
        }
      )
    })
  })
})
