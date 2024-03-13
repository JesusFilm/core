import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { GetAllTeamHosts_hosts as Host } from '../../../../../../../../../__generated__/GetAllTeamHosts'
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
          __typename: 'Translation'
        }
      ]
    },
    host: defaultHost
  } as unknown as Journey

  it('should render the list of hosts', async () => {
    const { getByRole } = render(
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

  it('should update journey host on list item click', async () => {
    const handleSelectHost = jest.fn()

    const result = jest.fn(() => ({
      data: {
        journeyUpdate: {
          id: journey.id,
          host: {
            id: host2.id
          }
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: UPDATE_JOURNEY_HOST,
              variables: {
                id: journey.id,
                input: {
                  hostId: host2.id
                }
              }
            },
            result
          }
        ]}
      >
        <ThemeProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <HostList
              teamHosts={{ hosts: [defaultHost, host2] }}
              handleSelection={handleSelectHost}
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

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(handleSelectHost).toHaveBeenCalled()
  })
})
