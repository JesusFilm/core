import { MockedProvider } from '@apollo/client/testing'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { JourneyProvider } from '../../../../libs/context'
import { defaultJourney } from '../../data'
import { DescriptionDialog, JOURNEY_DESC_UPDATE } from '.'

const onClose = jest.fn()

describe('JourneyView/Menu/DescriptionDialog', () => {
  it('should not set journey description on close', () => {
    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <JourneyProvider value={defaultJourney}>
          <DescriptionDialog open onClose={onClose} />
        </JourneyProvider>
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

    const { getByRole, getByText } = render(
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
        <JourneyProvider value={defaultJourney}>
          <DescriptionDialog open onClose={onClose} />
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.change(getByRole('textbox'), {
      target: { value: 'New Description' }
    })
    fireEvent.click(getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
    expect(getByText('Description updated successfully')).toBeInTheDocument()
  })
})
