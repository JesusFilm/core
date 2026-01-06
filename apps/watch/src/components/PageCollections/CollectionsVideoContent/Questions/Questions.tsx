import { sendGTMEvent } from '@next/third-parties/google'
import { ReactElement, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { Icon } from '@core/shared/ui/icons/Icon'

import { Question } from './Question'

interface QuestionData {
  id: number
  question: string
  answer: ReactElement | string
}

interface QuestionsProps {
  questions: QuestionData[]
  questionsTitle?: string
  askButtonText?: string
  contentId: string
}

export const Questions = ({
  questions,
  questionsTitle = 'Related questions',
  askButtonText = 'Ask yours',
  contentId
}: QuestionsProps): ReactElement => {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null)

  const handleQuestionToggle = (id: number): void => {
    setOpenQuestion(openQuestion === id ? null : id)
  }

  function handleAskQuestionClick() {
    sendGTMEvent({
      event: 'ask_question_button_click',
      eventId: uuidv4(),
      date: new Date().toISOString(),
      contentId
    })
  }

  return (
    <div className="xl:w-2/5">
      <div className="questions-block pt-16 xl:pt-4">
        <div className="padded mb-6 flex flex-wrap items-center justify-between">
          <h4 className="flex flex-shrink-0 items-center gap-4 py-4 text-sm font-semibold tracking-wider text-red-100/70 uppercase xl:text-base 2xl:text-lg">
            {questionsTitle}
          </h4>

          <a
            href="https://issuesiface.com/talk?utm_source=jesusfilm-watch"
            target="_blank"
          >
            <button
              onClick={handleAskQuestionClick}
              data-testid="AskQuestionButton"
              rel="noopener noreferrer"
              aria-label="Ask a question"
              tabIndex={0}
              className="inline-flex flex-shrink-0 cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold tracking-wider text-black uppercase transition-colors duration-200 hover:bg-red-500 hover:text-white"
            >
              <Icon
                name="MessageCircle"
                sx={{
                  width: 16,
                  height: 16
                }}
              />
              <span>{askButtonText}</span>
            </button>
          </a>
        </div>

        <div className="relative">
          {questions.map((q) => (
            <Question
              key={q.id}
              question={q.question}
              isOpen={openQuestion === q.id}
              onToggle={() => handleQuestionToggle(q.id)}
            >
              {q.answer}
            </Question>
          ))}
        </div>
      </div>
    </div>
  )
}
