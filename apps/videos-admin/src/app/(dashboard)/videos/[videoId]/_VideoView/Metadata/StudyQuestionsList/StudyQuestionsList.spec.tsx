import { MockedProvider } from '@apollo/client/testing'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { DELETE_STUDY_QUESTION, StudyQuestionsList } from './StudyQuestionsList'

// Mock notistack
jest.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: jest.fn()
  })
}))

describe('StudyQuestions', () => {
  it('should render', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <StudyQuestionsList
            studyQuestions={[
              {
                id: 'studyQuestion.1',
                value: 'Study question 1 text'
              },
              {
                id: 'studyQuestions.2',
                value: 'Study question 2 text'
              },
              {
                id: 'studyQuestion.3',
                value: 'Study question 3 text'
              }
            ]}
          />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByText('Study Questions')).toBeInTheDocument()

    const question1 = screen.getByTestId('OrderedItem-0')
    const question2 = screen.getByTestId('OrderedItem-1')
    const question3 = screen.getByTestId('OrderedItem-2')

    await waitFor(() =>
      expect(
        within(question1).getByText('1. Study question 1 text')
      ).toBeInTheDocument()
    )

    expect(
      within(question2).getByText('2. Study question 2 text')
    ).toBeInTheDocument()
    expect(
      within(question3).getByText('3. Study question 3 text')
    ).toBeInTheDocument()
  })

  it('should render fallback', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <StudyQuestionsList studyQuestions={[]} />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByText('No study questions')).toBeInTheDocument()
  })

  it('should open delete dialog when delete action is clicked', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <StudyQuestionsList
            studyQuestions={[
              {
                id: 'studyQuestion.1',
                value: 'Study question 1 text'
              }
            ]}
          />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    // Open the menu for the first item
    const menuButton = screen.getByLabelText('ordered-item-actions')
    fireEvent.click(menuButton)

    // Click the delete action
    const deleteAction = screen.getByText('Delete')
    fireEvent.click(deleteAction)

    // Check if the dialog is shown
    expect(screen.getByText('Delete Study Question')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Are you sure you want to delete this study question? This action cannot be undone.'
      )
    ).toBeInTheDocument()
  })

  it('should close delete dialog when cancel is clicked', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <StudyQuestionsList
            studyQuestions={[
              {
                id: 'studyQuestion.1',
                value: 'Study question 1 text'
              }
            ]}
          />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    // Open the menu for the first item
    const menuButton = screen.getByLabelText('ordered-item-actions')
    fireEvent.click(menuButton)

    // Click the delete action
    const deleteAction = screen.getByText('Delete')
    fireEvent.click(deleteAction)

    // Click cancel
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    // The dialog should be closed
    await waitFor(() => {
      expect(
        screen.queryByText('Delete Study Question')
      ).not.toBeInTheDocument()
    })
  })

  it('should handle delete when confirmed', async () => {
    const mocks = [
      {
        request: {
          query: DELETE_STUDY_QUESTION,
          variables: { id: 'studyQuestion.1' }
        },
        result: {
          data: {
            videoStudyQuestionDelete: {
              id: 'studyQuestion.1'
            }
          }
        }
      }
    ]

    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider mocks={mocks} addTypename={false}>
          <StudyQuestionsList
            studyQuestions={[
              {
                id: 'studyQuestion.1',
                value: 'Study question 1 text'
              }
            ]}
          />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    // Open the menu for the first item
    const menuButton = screen.getByLabelText('ordered-item-actions')
    fireEvent.click(menuButton)

    // Click the delete action
    const deleteAction = screen.getByText('Delete')
    fireEvent.click(deleteAction)

    // Click the delete button to confirm
    const deleteButton = screen.getByText('Delete', { selector: 'button' })
    fireEvent.click(deleteButton)

    // Wait for the mutation to complete and dialog to close
    await waitFor(() => {
      expect(
        screen.queryByText('Delete Study Question')
      ).not.toBeInTheDocument()
    })
  })
})
