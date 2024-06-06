import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { DeleteHost } from '../../../../../../../../../__generated__/DeleteHost'
import { GetAllTeamHosts_hosts as Host } from '../../../../../../../../../__generated__/GetAllTeamHosts'
import {
  UpdateJourneyHost,
  UpdateJourneyHostVariables
} from '../../../../../../../../../__generated__/UpdateJourneyHost'
import { UPDATE_JOURNEY_HOST } from '../../../../../../../../libs/useUpdateJourneyHostMutation/useUpdateJourneyHostMutation'
import { ThemeProvider } from '../../../../../../../ThemeProvider'

import { DELETE_HOST, HostForm } from './HostForm'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('HostForm', () => {
  const defaultHost: Host = {
    id: 'hostId',
    __typename: 'Host',
    title: 'Cru International',
    location: 'Florida, USA',
    src1: 'imageSrc1',
    src2: 'imageSrc2'
  }

  const journey = {
    __typename: 'Journey',
    id: 'journeyId',
    seoTitle: 'My awesome journey',
    host: defaultHost,
    team: { id: 'teamId' }
  } as unknown as Journey

  it('should render a create host form', async () => {
    const handleSelection = jest.fn()
    const { getByRole, getByTestId, getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: { ...journey, host: null },
              variant: 'admin'
            }}
          >
            <HostForm
              handleSelection={handleSelection}
              getAllTeamHostsQuery={jest.fn()}
            />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    expect(getByRole('button', { name: 'Back' })).toBeInTheDocument()
    expect(getByRole('textbox', { name: 'Host Name' })).toHaveAttribute(
      'value',
      ''
    )
    expect(getByRole('textbox', { name: 'Location' })).toHaveAttribute(
      'value',
      ''
    )
    expect(getByTestId('avatar1').firstChild).toHaveAttribute(
      'data-testid',
      'UserProfile2Icon'
    )
    expect(getByTestId('avatar2').firstChild).toHaveAttribute(
      'data-testid',
      'Plus2Icon'
    )
    expect(getByTestId('AlertCircleIcon')).toBeInTheDocument()
    expect(
      getByText(
        'Edits: Making changes here will apply to all journeys that share this Host.'
      )
    ).toBeInTheDocument()
  })

  it('should render an edit host form', async () => {
    const { getByRole, getByAltText, getByText, getByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <HostForm
              handleSelection={jest.fn()}
              getAllTeamHostsQuery={jest.fn()}
            />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    expect(getByRole('button', { name: 'Clear' })).toBeInTheDocument()
    expect(getByRole('textbox', { name: 'Host Name' })).toHaveAttribute(
      'value',
      defaultHost.title
    )
    expect(getByRole('textbox', { name: 'Location' })).toHaveAttribute(
      'value',
      defaultHost.location
    )
    expect(getByAltText('avatar1')).toHaveAttribute('src', defaultHost.src1)
    expect(getByAltText('avatar2')).toHaveAttribute('src', defaultHost.src2)
    expect(getByTestId('AlertCircleIcon')).toBeInTheDocument()
    expect(
      getByText(
        'Edits: Making changes here will apply to all journeys that share this Host.'
      )
    ).toBeInTheDocument()
  })

  it('should navigate to list on back button click', () => {
    const handleSelection = jest.fn()
    const { getByRole } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: { ...journey, host: null },
              variant: 'admin'
            }}
          >
            <HostForm
              handleSelection={handleSelection}
              getAllTeamHostsQuery={jest.fn()}
            />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Back' }))
    expect(handleSelection).toHaveBeenCalledWith('list')
  })

  it('should delete and update journey host on clear button click', async () => {
    const updateJourneyHostMock: MockedResponse<
      UpdateJourneyHost,
      UpdateJourneyHostVariables
    > = {
      request: {
        query: UPDATE_JOURNEY_HOST,
        variables: {
          id: journey.id,
          input: {
            hostId: null
          }
        }
      },
      result: jest.fn(() => ({
        data: {
          journeyUpdate: {
            __typename: 'Journey',
            id: journey.id,
            host: {
              __typename: 'Host',
              id: defaultHost.id
            }
          }
        }
      }))
    }

    const hostDeleteMock: MockedResponse<DeleteHost> = {
      request: {
        query: DELETE_HOST,
        variables: {
          id: defaultHost.id,
          teamId: journey.team?.id
        }
      },
      result: jest.fn(() => ({
        data: {
          hostDelete: {
            __typename: 'Host',
            id: defaultHost.id
          }
        }
      }))
    }

    const handleSelection = jest.fn()
    const mockGetAllTeamHostsQuery = jest.fn()
    const { getByRole } = render(
      <MockedProvider mocks={[hostDeleteMock, updateJourneyHostMock]}>
        <ThemeProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <HostForm
              handleSelection={handleSelection}
              getAllTeamHostsQuery={mockGetAllTeamHostsQuery}
            />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Clear' }))

    await waitFor(() => expect(hostDeleteMock.result).toHaveBeenCalled())
    expect(updateJourneyHostMock.result).toHaveBeenCalled()
    expect(mockGetAllTeamHostsQuery).toHaveBeenCalledWith({
      variables: { teamId: journey.team?.id }
    })
    expect(handleSelection).toHaveBeenCalledWith('selection')
  })
})
