import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

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
  onOpenDialog?: () => void
}

export const Questions = ({
  questions,
  questionsTitle = 'Связанные вопросы',
  askButtonText = 'Задайте ваш',
  onOpenDialog
}: QuestionsProps): ReactElement => {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null)
  const { t } = useTranslation('apps-watch')

  const handleQuestionToggle = (id: number): void => {
    setOpenQuestion(openQuestion === id ? null : id)
  }

  return (
    <div className="xl:w-2/5">
      <div className="questions-block pt-16 xl:pt-4">
        <div className="flex items-center justify-between mb-6 padded">
          <div className="flex items-center gap-4">
            <h4 className="text-sm xl:text-base 2xl:text-lg font-semibold tracking-wider uppercase text-red-100/70">
              {questionsTitle}
            </h4>
          </div>
          <button
            onClick={onOpenDialog}
            aria-label="Задать вопрос"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onOpenDialog?.()
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs text-black font-bold uppercase tracking-wider rounded-full bg-white hover:bg-red-500 hover:text-white transition-colors duration-200 cursor-pointer"
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
