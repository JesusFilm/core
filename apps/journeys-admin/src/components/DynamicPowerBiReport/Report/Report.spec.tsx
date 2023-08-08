import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { PowerBIEmbed } from 'powerbi-client-react'
import { useEffect } from 'react'

import { JourneysReportType } from '../../../../__generated__/globalTypes'

import { GET_ADMIN_JOURNEYS_REPORT } from './Report'

import { Report } from '.'

const MockPowerBiEmbed = PowerBIEmbed as unknown as jest.MockedClass<
  typeof PowerBIEmbed
>
jest.mock('powerbi-client-react', () => ({
  __esModule: true,
  PowerBIEmbed: jest.fn(() => <></>)
}))

describe('Report', () => {
  it('should render the report', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <Report reportType={JourneysReportType.multipleFull} />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByTestId('powerBi-multipleFull-report')).toBeInTheDocument()
  })

  it('gets the report token', async () => {
    const result = jest.fn(() => ({
      data: {
        adminJourneysReport: {
          embedUrl: 'url',
          accessToken: 'token'
        }
      }
    }))

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_ADMIN_JOURNEYS_REPORT,
              variables: { reportType: JourneysReportType.multipleFull }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <Report reportType={JourneysReportType.multipleFull} />
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should shows error message if error retrieving token', async () => {
    const { getByText } = render(
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
          <Report reportType={JourneysReportType.multipleFull} />
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(
        getByText('There was an error loading the report')
      ).toBeInTheDocument()
    )
  })

  it('should render powerBiReport', async () => {
    MockPowerBiEmbed.mockImplementation(({ eventHandlers }) => {
      useEffect(() => {
        eventHandlers?.get('rendered')?.()
      }, [eventHandlers])
      return (<>TestReport</>) as unknown as PowerBIEmbed
    })

    const { getByText } = render(
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
          <Report reportType={JourneysReportType.multipleFull} />
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(getByText('TestReport')).toBeInTheDocument())
  })

  it('show error message if powerBiReport fails to load', async () => {
    MockPowerBiEmbed.mockImplementation(({ eventHandlers }) => {
      useEffect(() => {
        eventHandlers?.get('error')?.()
      }, [eventHandlers])
      return (<></>) as unknown as PowerBIEmbed
    })

    const { getByText } = render(
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
          <Report reportType={JourneysReportType.multipleFull} />
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(
        getByText('There was an error loading the report')
      ).toBeInTheDocument()
    )
  })
})
