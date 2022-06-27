import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { JourneysReportType } from '../../../__generated__/globalTypes'
import { GET_ADMIN_JOURNEYS_REPORT } from './Remote/Remote'
import { PowerBiReport } from '.'

describe('PowerBiReport', () => {
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
          <PowerBiReport reportType={JourneysReportType.multipleFull} />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(getByTestId('powerBi-multipleFull-report')).toBeInTheDocument()
    )
  })

  it('should show the loading message', async () => {
    const { getByText, getByTestId } = render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <PowerBiReport reportType={JourneysReportType.multipleFull} />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByText('The analytics are loading...')).toBeInTheDocument()
    await waitFor(() =>
      expect(getByTestId('powerBi-multipleFull-report')).toHaveStyle(
        'visibility: hidden'
      )
    )
  })

  it('should show the error message', async () => {
    const { getByText, getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_ADMIN_JOURNEYS_REPORT,
              variables: { reportType: JourneysReportType.multipleFull }
            },
            error: new Error('Error retrieving token')
          }
        ]}
      >
        <SnackbarProvider>
          <PowerBiReport reportType={JourneysReportType.multipleFull} />
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(
        getByText('There was an error loading the report')
      ).toBeInTheDocument()
    )
    expect(getByTestId('powerBi-multipleFull-report')).toHaveStyle(
      'visibility: hidden'
    )
  })
})
