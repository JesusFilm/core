'use client'

import { ReactElement } from 'react'

interface StudyQuestion {
  value: string
  primary: boolean
}

interface StudyQuestionsProps {
  questions: StudyQuestion[]
}

export function StudyQuestions({
  questions
}: StudyQuestionsProps): ReactElement {
  if (questions.length === 0) {
    return <></>
  }

  return (
    <div className="mt-4">
      <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
        Study Questions
      </h3>
      <ul className="space-y-3">
        {questions.map((question, index) => (
          <li key={index} className="text-sm text-gray-700 dark:text-gray-400">
            <span className="font-medium">{index + 1}.</span> {question.value}
          </li>
        ))}
      </ul>
    </div>
  )
}
