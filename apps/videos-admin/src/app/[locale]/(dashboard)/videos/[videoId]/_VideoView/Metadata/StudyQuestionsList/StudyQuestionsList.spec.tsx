import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { mockStudyQuestions } from './data.mock'
import {
  StudyQuestionsList,
  UPDATE_STUDY_QUESTION_ORDER,
  UpdateStudyQuestionOrder,
  UpdateStudyQuestionOrderVariables
} from './StudyQuestionsList'

const getUpdateStudyQuestionOrderMock = <
  T extends { id: string; order: number }
>(
  input: T
): MockedResponse<
  UpdateStudyQuestionOrder,
  UpdateStudyQuestionOrderVariables
> => ({
  request: {
    query: UPDATE_STUDY_QUESTION_ORDER,
    variables: {
      input
    }
  },
  result: jest.fn(() => ({
    data: {
      videoStudyQuestionUpdate: {
        id: input.id,
        value: 'Study questions value'
      }
    }
  }))
})

describe('StudyQuestions', () => {
  it('should render', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <StudyQuestionsList studyQuestions={mockStudyQuestions} />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByText('Study Questions')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Add Question' })
    ).toBeInTheDocument()

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

  it('should update order on order select update', async () => {
    const mockOrderUpdate = getUpdateStudyQuestionOrderMock({
      id: 'studyQuestion.1',
      order: 3
    })

    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider mocks={[mockOrderUpdate]}>
          <StudyQuestionsList studyQuestions={mockStudyQuestions} />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    const question1 = screen.getByTestId('OrderedItem-0')

    await fireEvent.mouseDown(within(question1).getByRole('combobox'))

    const options = within(screen.getByRole('listbox')).getAllByRole('option')

    fireEvent.click(options[2])
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
})
