import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor, within } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { ThemeProvider } from '../../../../../../../ThemeProvider'

import { DELETE_HOST, HostForm } from './HostForm'
import { UPDATE_JOURNEY_HOST } from './HostTitleFieldForm/HostTitleFieldForm'

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
  const defaultHost = {
    id: 'hostId',
    __typename: 'Host',
    teamId: 'teamId',
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

  it('should render an create host form', async () => {
    const { getByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: { ...journey, host: null },
              variant: 'admin'
            }}
          >
            <HostForm onClear={jest.fn()} onClose={jest.fn()} />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    const sidePanel = within(getByTestId('side-panel'))

    expect(
      sidePanel.getByRole('textbox', { name: 'Host Name Host Name' })
    ).toHaveAttribute('value', '')
    expect(
      sidePanel.getByRole('textbox', { name: 'Location Location' })
    ).toHaveAttribute('value', '')
    expect(sidePanel.getByTestId('avatar1').firstChild).toHaveAttribute(
      'data-testid',
      'UserProfileAddIcon'
    )
    expect(sidePanel.getByTestId('avatar2').firstChild).toHaveAttribute(
      'data-testid',
      'UserProfileAddIcon'
    )
  })

  it('should render an edit host form', async () => {
    const { getByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <HostForm onClear={jest.fn()} onClose={jest.fn()} />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    const sidePanel = within(getByTestId('side-panel'))

    expect(sidePanel.getByRole('button', { name: 'Clear' })).toBeInTheDocument()
    expect(
      sidePanel.getByRole('textbox', { name: 'Host Name Host Name' })
    ).toHaveAttribute('value', defaultHost.title)
    expect(
      sidePanel.getByRole('textbox', { name: 'Location Location' })
    ).toHaveAttribute('value', defaultHost.location)
    expect(sidePanel.getByAltText('avatar1')).toHaveAttribute(
      'src',
      defaultHost.src1
    )
    expect(sidePanel.getByAltText('avatar2')).toHaveAttribute(
      'src',
      defaultHost.src2
    )
  })

  it('should delete and update journey host on clear button click', async () => {
    const onClear = jest.fn()

    const result = jest.fn(() => ({
      data: {
        hostDelete: {
          id: defaultHost.id
        }
      }
    }))
    const journeyUpdate = jest.fn(() => ({
      data: {
        journeyUpdate: {
          id: journey.id,
          host: {
            id: null
          }
        }
      }
    }))

    const { getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: DELETE_HOST,
              variables: {
                id: defaultHost.id,
                teamId: defaultHost.teamId
              }
            },
            result
          },
          {
            request: {
              query: UPDATE_JOURNEY_HOST,
              variables: {
                id: journey.id,
                input: {
                  hostId: null
                }
              }
            },
            result: journeyUpdate
          }
        ]}
      >
        <ThemeProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <HostForm onClear={onClear} onClose={jest.fn()} />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    const sidePanel = within(getByTestId('side-panel'))

    fireEvent.click(sidePanel.getByRole('button', { name: 'Clear' }))

    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() => expect(journeyUpdate).toHaveBeenCalled())
    await waitFor(() => expect(onClear).toHaveBeenCalled())
  })
})
