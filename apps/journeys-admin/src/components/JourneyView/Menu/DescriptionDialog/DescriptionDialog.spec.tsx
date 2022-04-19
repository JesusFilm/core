import { MockedProvider } from '@apollo/client/testing'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { JourneyProvider } from '../../../../libs/context'
import { defaultJourney } from '../../data'
import { DescriptionDialog, JOURNEY_DESC_UPDATE } from '.'

const onClose = jest.fn()

describe('JourneyView/Menu/DescriptionDialog', () => {
  it('should not set journey description on close', () => {
    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <JourneyProvider value={defaultJourney}>
            <DescriptionDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getByRole('textbox'), {
      target: { value: 'New Description' }
    })
    fireEvent.click(getByRole('button', { name: 'Cancel' }))

    expect(onClose).toBeCalled()
  })

  it('should update journey description on submit', async () => {
    const updatedJourney = {
      description: 'New Description'
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
              query: JOURNEY_DESC_UPDATE,
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
          <JourneyProvider value={defaultJourney}>
            <DescriptionDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getByRole('textbox'), {
      target: { value: 'New Description' }
    })
    fireEvent.click(getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
  })

  it('shows notistack error alert when description fails to update', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_DESC_UPDATE,
              variables: {
                id: defaultJourney.id,
                input: {
                  description: 'New Description'
                }
              }
            },
            error: new Error('An error occurred')
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider value={defaultJourney}>
            <DescriptionDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getByRole('textbox'), {
      target: { value: 'New Description' }
    })
    fireEvent.click(getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(getByText('An error occurred')).toBeInTheDocument()
    )
  })
})
