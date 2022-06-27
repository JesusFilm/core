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
                    'https://app.powerbi.com/reportEmbed?reportId=f6bfd646-b718-44dc-a378-b73e6b528204&groupId=be8908da-da25-452e-b220-163f52476cdd&w=2&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLVVTLU5PUlRILUNFTlRSQUwtcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQiLCJlbWJlZEZlYXR1cmVzIjp7Im1vZGVybkVtYmVkIjp0cnVlLCJhbmd1bGFyT25seVJlcG9ydEVtYmVkIjp0cnVlLCJjZXJ0aWZpZWRUZWxlbWV0cnlFbWJlZCI6dHJ1ZSwidXNhZ2VNZXRyaWNzVk5leHQiOnRydWUsInNraXBab25lUGF0Y2giOnRydWV9fQ%3d%3d',
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
