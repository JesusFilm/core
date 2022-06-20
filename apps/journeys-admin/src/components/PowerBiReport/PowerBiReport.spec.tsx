import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { useEffect } from 'react'
import { PowerBIEmbed } from 'powerbi-client-react'
import { JourneysReportType } from '../../../__generated__/globalTypes'
import { GET_ADMIN_JOURNEYS_REPORT } from './PowerBiReport'
import { PowerBiReport } from '.'

const MockPowerBiEmbed = PowerBIEmbed as unknown as jest.MockedClass<
  typeof PowerBIEmbed
>
jest.mock('powerbi-client-react', () => ({
  __esModule: true,
  PowerBIEmbed: jest.fn(() => <></>)
}))

describe('PowerBiReport', () => {
  it('should render the report', () => {
    const onLoad = jest.fn()
    const onError = jest.fn()

    const { getByTestId } = render(
      <MockedProvider>
        <PowerBiReport
          reportType={JourneysReportType.multipleFull}
          onLoad={onLoad}
          onError={onError}
        />
      </MockedProvider>
    )
    expect(getByTestId('powerBi-multipleFull-report')).toBeInTheDocument()
  })

  it('gets the report token', async () => {
    const onLoad = jest.fn()
    const onError = jest.fn()

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
        <PowerBiReport
          reportType={JourneysReportType.multipleFull}
          onLoad={onLoad}
          onError={onError}
        />
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('calls onError if there is error retrieving token', async () => {
    const onLoad = jest.fn()
    const onError = jest.fn()

    render(
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
        <PowerBiReport
          reportType={JourneysReportType.multipleFull}
          onLoad={onLoad}
          onError={onError}
        />
      </MockedProvider>
    )
    await waitFor(() => expect(onError).toHaveBeenCalled())
  })

  it('calls onLoad when powerBi report is rendered', async () => {
    const onLoad = jest.fn()
    const onError = jest.fn()

    MockPowerBiEmbed.mockImplementation(({ eventHandlers }) => {
      useEffect(() => {
        eventHandlers?.get('rendered')?.()
      }, [eventHandlers])
      return (<></>) as unknown as PowerBIEmbed
    })

    render(
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
        <PowerBiReport
          reportType={JourneysReportType.multipleFull}
          onLoad={onLoad}
          onError={onError}
        />
      </MockedProvider>
    )
    await waitFor(() => expect(onLoad).toHaveBeenCalled())
  })
  it('calls onError when powerBi report has an error', async () => {
    const onLoad = jest.fn()
    const onError = jest.fn()

    MockPowerBiEmbed.mockImplementation(({ eventHandlers }) => {
      useEffect(() => {
        eventHandlers?.get('error')?.()
      }, [eventHandlers])
      return (<></>) as unknown as PowerBIEmbed
    })

    render(
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
        <PowerBiReport
          reportType={JourneysReportType.multipleFull}
          onLoad={onLoad}
          onError={onError}
        />
      </MockedProvider>
    )
    await waitFor(() => expect(onError).toHaveBeenCalled())
  })
})
