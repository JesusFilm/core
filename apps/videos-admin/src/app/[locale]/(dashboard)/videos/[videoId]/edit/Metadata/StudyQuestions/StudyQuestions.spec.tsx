import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { StudyQuestions, UPDATE_STUDY_QUESTION_ORDER, UpdateStudyQuestionOrder, UpdateStudyQuestionOrderVariables } from "./StudyQuestions"
import { mockStudyQuestions } from "./data.mock"
import { NextIntlClientProvider } from "next-intl"
import { MockedProvider, MockedResponse } from "@apollo/client/testing"

const getUpdateStudyQuestionOrderMock = <T extends { id: string; order: number}>(input: T): MockedResponse<UpdateStudyQuestionOrder, UpdateStudyQuestionOrderVariables> => ({
  request: {
    query: UPDATE_STUDY_QUESTION_ORDER,
    variables: {
      input
    }
  },
  result: jest.fn(() => ({
    data: {
      videoStudyQuestionUpdate: {
        id: input.id
      }
    }
  }))
})

describe('StudyQuestions', () => {
  it('should render', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <StudyQuestions studyQuestions={mockStudyQuestions} />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByText('Study Questions')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add Question'})).toBeInTheDocument()

    const questions = screen.getAllByTestId('OrderedItem')
    expect(questions.length).toBe(3)

    expect(within(questions[0]).getByText('Study question 1 text')).toBeInTheDocument()
    expect(within(questions[1]).getByText('Study question 2 text')).toBeInTheDocument()
    expect(within(questions[2]).getByText('Study question 3 text')).toBeInTheDocument()
  })

  it('should update order on drag', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <StudyQuestions studyQuestions={mockStudyQuestions} />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    const questions = screen.getAllByTestId('OrderedItem')

    // Figure out way to mock drag events
  })

  it('should update order on order select update', async () => {
    const mockOrderUpdate = getUpdateStudyQuestionOrderMock({ id: 'studyQuestion.1', order: 3 })

    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider mocks={[mockOrderUpdate]}>
          <StudyQuestions studyQuestions={mockStudyQuestions} />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    const questions = screen.getAllByTestId('OrderedItem')

    await fireEvent.mouseDown(within(questions[0]).getByRole('combobox'))

    const options = within(screen.getByRole('listbox')).getAllByRole('option')

    fireEvent.click(options[2])

    await waitFor(() => expect(mockOrderUpdate.result).toHaveBeenCalled())
  })

  it('should render fallback', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <StudyQuestions studyQuestions={[]} />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByText('No study questions')).toBeInTheDocument()
  })
})