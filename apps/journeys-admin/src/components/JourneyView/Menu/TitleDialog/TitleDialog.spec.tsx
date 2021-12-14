import { MockedProvider } from '@apollo/client/testing'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { TitleDialog, JOURNEY_TITLE_UPDATE } from '.'
import { defaultJourney } from '../../data'

const onClose = jest.fn()

describe('JourneyView/Menu/TitleDialog', () => {
  it('should not set journey title on close', () => {
    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <TitleDialog open onClose={onClose} />
      </MockedProvider>
    )

    const title = getByRole('textbox')
    const cancel = getByRole('button', { name: 'Cancel' })

    fireEvent.change(title, { target: { value: 'New Journey' } })
    fireEvent.click(cancel)

    expect(onClose).toBeCalled()
  })

  it('should update journey title on submit', async () => {
    const updatedJourney = {
      id: defaultJourney.id,
      title: 'New Journey'
    }

    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_TITLE_UPDATE,
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
        <TitleDialog open onClose={onClose} />
      </MockedProvider>
    )

    const title = getByRole('textbox')
    const submit = getByRole('button', { name: 'Save' })

    fireEvent.change(title, { target: { value: 'New Journey' } })
    fireEvent.click(submit)

    await waitFor(() => {
      expect(getByText('Title updated successfully')).toBeInTheDocument()
    })
  })
})
