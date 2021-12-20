import { MockedProvider } from '@apollo/client/testing'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { DescriptionDialog, JOURNEY_DESC_UPDATE } from '.'
import { JourneyProvider } from '../../Context'
import { defaultJourney } from '../../data'

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

    const description = getByRole('textbox')
    const cancel = getByRole('button', { name: 'Cancel' })

    fireEvent.change(description, { target: { value: 'New Description' } })
    fireEvent.click(cancel)

    expect(onClose).toBeCalled()
  })

  it('should update journey description on submit', async () => {
    const updatedJourney = {
      id: defaultJourney.id,
      description: 'New Description'
    }

    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_DESC_UPDATE,
              variables: {
                input: updatedJourney
              }
            },
            result: {
              data: {
                journeyUpdate: {
                  __typename: 'Journey',
                  ...updatedJourney
                }
              }
            }
          }
        ]}
      >
        <JourneyProvider value={defaultJourney}>
          <DescriptionDialog open onClose={onClose} />
        </JourneyProvider>
      </MockedProvider>
    )

    const description = getByRole('textbox')
    const submit = getByRole('button', { name: 'Save' })

    fireEvent.change(description, { target: { value: 'New Description' } })
    fireEvent.click(submit)

    await waitFor(() => {
      expect(getByText('Description updated successfully')).toBeInTheDocument()
    })
  })
})
