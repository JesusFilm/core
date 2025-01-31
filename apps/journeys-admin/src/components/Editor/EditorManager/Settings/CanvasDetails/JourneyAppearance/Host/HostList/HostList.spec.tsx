import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { GetAllTeamHosts_hosts as Host } from '../../../../../../../../../__generated__/GetAllTeamHosts'
import {
  UpdateJourneyHost,
  UpdateJourneyHostVariables
} from '../../../../../../../../../__generated__/UpdateJourneyHost'
import { UPDATE_JOURNEY_HOST } from '../../../../../../../../libs/useUpdateJourneyHostMutation/useUpdateJourneyHostMutation'
import { ThemeProvider } from '../../../../../../../ThemeProvider'

import { HostList } from './HostList'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

describe('HostList', () => {
  const defaultHost: Host = {
    id: 'hostId',
    __typename: 'Host' as const,
    title: 'Cru International',
    location: 'Florida, USA',
    src1: 'imageSrc1',
    src2: 'imageSrc2'
  }

  const host2: Host = {
    id: 'hostId2',
    __typename: 'Host' as const,
    title: 'Another host',
    location: 'Auckland, NZ',
    src1: null,
    src2: null
  }

  const journey = {
    __typename: 'Journey',
    id: 'journeyId',
    seoTitle: 'My awesome journey',
    language: {
      __typename: 'Language',
      id: '529',
      name: [
        {
          value: 'English',
          primary: true,
          __typename: 'LanguageName'
        }
      ]
    },
    host: defaultHost
  } as unknown as Journey

  it('should render host list', async () => {
    const { getByRole, getByText, getByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <HostList
              teamHosts={{ hosts: [defaultHost, host2] }}
              handleSelection={jest.fn()}
            />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    expect(getByText('Hosts')).toBeInTheDocument()
    expect(getByTestId('InformationCircleContainedIcon')).toBeInTheDocument()
    expect(getByRole('button', { name: 'Create New' })).toBeInTheDocument()

    expect(getByRole('list').children).toHaveLength(2)
    expect(
      getByRole('button', {
        name: `${defaultHost.title} ${defaultHost.location}`
      })
    ).toBeInTheDocument()
    expect(
      getByRole('button', {
        name: `${host2.title} ${host2.location}`
      })
    ).toBeInTheDocument()
  })

  it('should call handleselection on info button click, navigate to info', () => {
    const handleSelection = jest.fn()
    const { getByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <HostList
              teamHosts={{ hosts: [defaultHost, host2] }}
              handleSelection={handleSelection}
            />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('InformationCircleContainedIcon'))
    expect(handleSelection).toHaveBeenCalledWith('info')
  })

  it('should call handleselection on create new button click, navigate to form', () => {
    const handleSelection = jest.fn()
    const { getByRole } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <HostList
              teamHosts={{ hosts: [defaultHost, host2] }}
              handleSelection={handleSelection}
            />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Create New' }))
    expect(handleSelection).toHaveBeenCalledWith('form')
  })

  it('should update journey host on list item click, navigate to host selection', async () => {
    const handleSelection = jest.fn()

    const updateJourneyHostMock: MockedResponse<
      UpdateJourneyHost,
      UpdateJourneyHostVariables
    > = {
      request: {
        query: UPDATE_JOURNEY_HOST,
        variables: {
          id: journey.id,
          input: {
            hostId: host2.id
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
              id: host2.id
            }
          }
        }
      }))
    }
    const { getByRole } = render(
      <MockedProvider mocks={[updateJourneyHostMock]}>
        <ThemeProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <HostList
              teamHosts={{ hosts: [defaultHost, host2] }}
              handleSelection={handleSelection}
            />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    fireEvent.click(
      getByRole('button', {
        name: `${host2.title} ${host2.location}`
      })
    )

    await waitFor(() => expect(updateJourneyHostMock.result).toHaveBeenCalled())
    expect(handleSelection).toHaveBeenCalledWith('selection')
  })
})
