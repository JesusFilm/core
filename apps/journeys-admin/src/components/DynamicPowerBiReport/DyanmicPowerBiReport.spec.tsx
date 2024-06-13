import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneysReportType } from '../../../__generated__/globalTypes'

import { GET_ADMIN_JOURNEYS_REPORT } from './Report/Report'

import { MemoizedDynamicReport } from '.'

describe('DynamicPowerBiReport', () => {
  it('should render the report', async () => {
    const { getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_ADMIN_JOURNEYS_REPORT,
              variables: { reportType: JourneysReportType.multipleFull }
            },
            result: {
              data: {
                adminJourneysReport: {
                  embedUrl:
                    'https://app.powerbi.com/reportEmbed?reportId=reportId&groupId=groupId&config=config',
                  accessToken: 'token'
                }
              }
            }
          }
        ]}
      >
        <SnackbarProvider>
          <MemoizedDynamicReport reportType={JourneysReportType.multipleFull} />
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByTestId('powerBi-multipleFull-report')).toBeInTheDocument()
    )
  })
})
