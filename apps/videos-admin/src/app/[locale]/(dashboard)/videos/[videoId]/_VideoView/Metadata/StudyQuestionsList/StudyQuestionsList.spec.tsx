import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor, within } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { StudyQuestionsList } from './StudyQuestionsList'

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
        <MockedProvider>
          <StudyQuestionsList studyQuestions={[]} />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByText('No study questions')).toBeInTheDocument()
  })
})
