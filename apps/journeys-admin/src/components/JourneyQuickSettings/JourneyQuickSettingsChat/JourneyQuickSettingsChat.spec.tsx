import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  UpdateHost,
  UpdateHostVariables
} from '../../../../__generated__/UpdateHost'
import {
  UpdateJourneyHost,
  UpdateJourneyHostVariables
} from '../../../../__generated__/UpdateJourneyHost'
import { journey } from '../../../libs/useHostCreate/useHostCreate.mocks'
import { hostCreateMock } from '../../../libs/useHostCreateMutation/useHostCreateMutation.mock'
import { UPDATE_HOST } from '../../../libs/useHostUpdateMutation'
import { UPDATE_JOURNEY_HOST } from '../../../libs/useUpdateJourneyHostMutation/useUpdateJourneyHostMutation'

import { JourneyQuickSettingsChat } from './JourneyQuickSettingsChat'

describe('JourneyQuickSettingsChat', () => {
  it('should render elements', () => {
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <JourneyQuickSettingsChat />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(screen.getByRole('textbox', { name: 'Your Name' })).toHaveValue(
      'Cru International'
    )
    expect(screen.getByTestId('HostAvatarsButton')).toBeInTheDocument()
    expect(screen.getByTestId('Chat')).toBeInTheDocument()
  })

  it('should use display name in hostitlefieldform value if host does not exist', () => {
    render(
      <MockedProvider>
        <JourneyProvider
          value={{ journey: { ...journey, host: null }, variant: 'admin' }}
        >
          <JourneyQuickSettingsChat displayName="New Host Name" />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('textbox', { name: 'Your Name' })).toHaveValue(
      'New Host Name'
    )
  })

  it('should have empty value in hostitlefieldform if host does not exist and no display name', () => {
    render(
      <MockedProvider>
        <JourneyProvider
          value={{ journey: { ...journey, host: null }, variant: 'admin' }}
        >
          <JourneyQuickSettingsChat />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('textbox', { name: 'Your Name' })).toHaveValue('')
  })

  it('should call update host mutation on name change', async () => {
    const updateHostMock: MockedResponse<UpdateHost, UpdateHostVariables> = {
      request: {
        query: UPDATE_HOST,
        variables: {
          id: 'hostId',
          teamId: 'team.id',
          input: {
            title: 'Someone'
          }
        }
      },
      result: {
        data: {
          hostUpdate: {
            id: 'hostId',
            __typename: 'Host',
            title: 'Title',
            location: 'USA',
            src1: 'imageSrc1',
            src2: 'imageSrc2'
          }
        }
      }
    }

    const mockHostUpdateResult = jest
      .fn()
      .mockReturnValue(updateHostMock.result)

    render(
      <MockedProvider
        mocks={[{ ...updateHostMock, result: mockHostUpdateResult }]}
      >
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <JourneyQuickSettingsChat />
        </JourneyProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox', { name: 'Your Name' })
    fireEvent.change(input, { target: { value: 'Someone' } })
    fireEvent.submit(input)
    await waitFor(() => {
      expect(mockHostUpdateResult).toHaveBeenCalled()
    })
  })

  it('should call createhost mutation on name change if host does not exist', async () => {
    const mockCreateResult = jest.fn().mockReturnValue(hostCreateMock.result)

    const updateJourneyHostMock: MockedResponse<
      UpdateJourneyHost,
      UpdateJourneyHostVariables
    > = {
      request: {
        query: UPDATE_JOURNEY_HOST,
        variables: { id: 'journeyId', input: { hostId: 'host.id' } }
      },
      result: {
        data: {
          journeyUpdate: {
            __typename: 'Journey',
            id: 'journeyId',
            host: {
              __typename: 'Host',
              id: 'host.id'
            }
          }
        }
      }
    }

    const mockJourneyUpdateResult = jest
      .fn()
      .mockReturnValue(updateJourneyHostMock.result)

    render(
      <MockedProvider
        mocks={[
          { ...hostCreateMock, result: mockCreateResult },
          { ...updateJourneyHostMock, result: mockJourneyUpdateResult }
        ]}
      >
        <JourneyProvider
          value={{ journey: { ...journey, host: null }, variant: 'admin' }}
        >
          <JourneyQuickSettingsChat displayName="Person1" />
        </JourneyProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox', { name: 'Your Name' })
    fireEvent.change(input, { target: { value: 'value' } })
    fireEvent.submit(input)
    await waitFor(() => {
      expect(mockCreateResult).toHaveBeenCalled()
    })
  })
})
