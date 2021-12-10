import { MockedProvider } from '@apollo/client/testing'
import { render, fireEvent, waitFor } from '@testing-library/react'
import UpdateDialog, { JOURNEY_UPDATE } from '.'
import { UpdateJourneyFields } from '../Menu'
import { defaultJourney } from '../../../JourneyList/journeyListData'

const onClose = jest.fn()
const onSuccessTitle = jest.fn()
const onSuccessDescription = jest.fn()

describe('SingleJourney/UpdateDialog', () => {
  it('should not set journey title on close', () => {
    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <UpdateDialog
          field={UpdateJourneyFields.TITLE}
          open
          journey={defaultJourney}
          onClose={onClose}
          onSuccess={onSuccessTitle}
        />
      </MockedProvider>
    )

    const title = getByRole('textbox')
    const cancel = getByRole('button', { name: 'Cancel' })

    fireEvent.change(title, { target: { value: 'New Journey' } })
    fireEvent.click(cancel)

    expect(onClose).toBeCalled()
    expect(onSuccessTitle).not.toBeCalled()
  })

  it('should not set journey description on close', () => {
    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <UpdateDialog
          field={UpdateJourneyFields.DESCRIPTION}
          open
          journey={defaultJourney}
          onClose={onClose}
          onSuccess={onSuccessDescription}
        />
      </MockedProvider>
    )

    const description = getByRole('textbox')
    const cancel = getByRole('button', { name: 'Cancel' })

    fireEvent.change(description, { target: { value: 'New Description' } })
    fireEvent.click(cancel)

    expect(onClose).toBeCalled()
    expect(onSuccessDescription).not.toBeCalled()
  })

  it('should update journey title on submit', async () => {
    const updatedJourney = {
      id: defaultJourney.id,
      title: 'New Journey',
      description: 'Description'
    }

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_UPDATE,
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
        <UpdateDialog
          field={UpdateJourneyFields.TITLE}
          open
          journey={updatedJourney}
          onClose={onClose}
          onSuccess={onSuccessTitle}
        />
      </MockedProvider>
    )

    const title = getByRole('textbox')
    const submit = getByRole('button', { name: 'Save' })

    fireEvent.change(title, { target: { value: 'New Journey' } })
    fireEvent.click(submit)

    await waitFor(() => {
      expect(onSuccessTitle).toBeCalledWith({
        __typename: 'Journey',
        ...updatedJourney
      })
    })
  })

  it('should update journey description on submit', async () => {
    const updatedJourney = {
      id: defaultJourney.id,
      title: 'Journey',
      description: 'New Description'
    }

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_UPDATE,
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
        <UpdateDialog
          field={UpdateJourneyFields.DESCRIPTION}
          open
          journey={updatedJourney}
          onClose={onClose}
          onSuccess={onSuccessDescription}
        />
      </MockedProvider>
    )

    const description = getByRole('textbox')
    const submit = getByRole('button', { name: 'Save' })

    fireEvent.change(description, { target: { value: 'New Description' } })
    fireEvent.click(submit)

    await waitFor(() => {
      expect(onSuccessDescription).toBeCalledWith({
        __typename: 'Journey',
        ...updatedJourney
      })
    })
  })
})
