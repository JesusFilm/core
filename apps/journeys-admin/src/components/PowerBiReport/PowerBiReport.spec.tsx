import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { JourneysReportType } from '../../../__generated__/globalTypes'
import { GET_ADMIN_JOURNEYS_REPORT } from './PowerBiReport'
import { PowerBiReport } from '.'

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
          embedUrl:
            'https://app.powerbi.com/reportEmbed?reportId=f6bfd…leHQiOnRydWUsInNraXBab25lUGF0Y2giOnRydWV9fQ%3d%3d',
          accessToken:
            'H4sIAAAAAAAEACWWxc7GjK2E7-XfplKYKnURZubswoxvuDr3fj…lbWJlZEZlYXR1cmVzIjp7Im1vZGVybkVtYmVkIjpmYWxzZX19'
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

  it('call onLoad', () => {})
  it('call onError', () => {})
})
