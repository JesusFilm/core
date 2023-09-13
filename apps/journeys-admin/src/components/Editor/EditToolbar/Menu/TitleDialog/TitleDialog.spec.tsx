import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { defaultJourney } from '../../../../JourneyView/data'

import { JOURNEY_TITLE_UPDATE, TitleDialog } from '.'

const onClose = jest.fn()

describe('JourneyView/Menu/TitleDialog', () => {
  it('should not set journey title on close', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <TitleDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getByRole('textbox'), {
      target: { value: 'New Journey' }
    })
    fireEvent.click(getByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('should update journey title on submit', async () => {
    const updatedJourney = {
      title: 'New Journey'
    }

    const result = jest.fn(() => ({
      data: {
        journeyUpdate: {
          id: defaultJourney.id,
          __typename: 'Journey',
          ...updatedJourney
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_TITLE_UPDATE,
              variables: {
                id: defaultJourney.id,
                input: updatedJourney
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <TitleDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getByRole('textbox'), { target: { value: 'New Journey' } })
    fireEvent.click(getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
  })

  it('shows notistack error alert when title fails to update', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_TITLE_UPDATE,
              variables: {
                id: defaultJourney.id,
                input: {
                  title: 'New Journey'
                }
              }
            }
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <TitleDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getByRole('textbox'), { target: { value: 'New Journey' } })
    fireEvent.click(getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(
        getByText('Field update failed. Reload the page or try again.')
      ).toBeInTheDocument()
    )
  })

  it('is a required field', async () => {
    const result = jest.fn(() => ({
      data: {
        journeyUpdate: {
          id: defaultJourney.id,
          __typename: 'Journey'
        }
      }
    }))

    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_TITLE_UPDATE,
              variables: {
                id: defaultJourney.id,
                input: {
                  title: 'New Journey'
                }
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <TitleDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getByRole('textbox'), { target: { value: '' } })
    fireEvent.click(getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(getByText('Required')).toBeInTheDocument())
    await waitFor(() => expect(result).not.toHaveBeenCalled())
  })
})
