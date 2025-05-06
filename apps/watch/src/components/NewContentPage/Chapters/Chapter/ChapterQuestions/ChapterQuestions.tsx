import { ReactElement, useState } from 'react'

import { VideoChildFields_studyQuestions } from '../../../../../../__generated__/VideoChildFields'
import MessageCircle from '@core/shared/ui/icons/MessageCircle'
import { useTranslation } from 'next-i18next'

import { Question } from './Question'

interface ChapterQuestionsProps {
  questions: VideoChildFields_studyQuestions[]
}

export function ChapterQuestions({
  questions
}: ChapterQuestionsProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const [openQuestion, setOpenQuestion] = useState<string | null>(null)

  const handleQuestionToggle = (id: string): void => {
    setOpenQuestion(openQuestion === id ? null : id)
  }

  return (
    <div data-testid="ChapterQuestions" className="xl:w-2/5">
      <div className="questions-block pt-16 xl:pt-4">
        <div className="flex flex-wrap items-center justify-between mb-6 padded">
          <h4 className="flex items-center gap-4 text-sm xl:text-base 2xl:text-lg font-semibold tracking-wider uppercase text-red-100/70 flex-shrink-0 py-4">
            Related Questions
          </h4>

          <a
            href="https://issuesiface.com/talk?utm_source=jesusfilm-watch"
            target="_blank"
          >
            <button
              onClick={() => {}}
              data-testid="AskQuestionButton"
              rel="noopener noreferrer"
              aria-label="Ask a question"
              tabIndex={0}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs text-black font-bold uppercase tracking-wider rounded-full bg-white hover:bg-red-500 hover:text-white transition-colors duration-200 cursor-pointer flex-shrink-0"
            >
              <MessageCircle sx={{ fontSize: 16 }} />
              <span>{t('Ask yours')}</span>
            </button>
          </a>
        </div>

        <div className="relative">
          {questions.map((q) => (
            <Question
              key={q.id}
              question={q.value}
              isOpen={openQuestion === q.id}
              onToggle={() => handleQuestionToggle(q.id)}
              answer={t(
                'Process what you learned -- Have a private discussion with someone who is ready to listen.'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
