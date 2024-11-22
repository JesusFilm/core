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
import { EditProvider } from '../../../_EditProvider'

describe('StudyQuestions', () => {
  it('should render', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <EditProvider initialState={{ isEdit: true }}>
          <MockedProvider>
            <StudyQuestionsList studyQuestions={mockStudyQuestions} />
          </MockedProvider>
        </EditProvider>
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

  it('should render fallback', () => {
    render(
      <NextIntlClientProvider locale="en">
        <EditProvider initialState={{ isEdit: true }}>
          <MockedProvider>
            <StudyQuestionsList studyQuestions={[]} />
          </MockedProvider>
        </EditProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByText('No study questions')).toBeInTheDocument()
  })
})
