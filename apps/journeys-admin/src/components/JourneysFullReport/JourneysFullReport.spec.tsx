import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { JourneysReportType } from '../../../__generated__/globalTypes'
import { GET_ADMIN_JOURNEYS_REPORT } from '../PowerBiReport/PowerBiReport'
import { JourneysFullReport } from '.'

describe('JourneysFullReport', () => {
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
                  embedUrl: 'url',
                  accessToken: 'token'
                }
              }
            }
          }
        ]}
      >
        <SnackbarProvider>
          <JourneysFullReport />
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
          <JourneysFullReport />
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
          <JourneysFullReport />
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
