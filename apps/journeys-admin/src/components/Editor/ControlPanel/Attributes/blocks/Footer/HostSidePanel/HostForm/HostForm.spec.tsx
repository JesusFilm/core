import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

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
    const { getByRole, getByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: { ...journey, host: null },
              variant: 'admin'
            }}
          >
            <HostForm onClear={jest.fn()} />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

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
  })

  it('should render an edit host form', async () => {
    const { getByRole, getByAltText } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <HostForm onClear={jest.fn()} />
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

    const { getByRole } = render(
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
            <HostForm onClear={onClear} />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Clear' }))

    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() => expect(journeyUpdate).toHaveBeenCalled())
    await waitFor(() => expect(onClear).toHaveBeenCalled())
  })
})
