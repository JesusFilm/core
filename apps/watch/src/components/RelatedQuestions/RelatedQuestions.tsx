import { sendGTMEvent } from '@next/third-parties/google'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { Icon } from '@core/shared/ui/icons/Icon'

import { VideoContentFields_studyQuestions } from '../../../__generated__/VideoContentFields'

import { Question } from './Question'

interface RelatedQuestionsProps {
  questions: VideoContentFields_studyQuestions[]
  onOpenDialog?: () => void
  contentId: string
}

export const RelatedQuestions = ({
  questions,
  onOpenDialog,
  contentId
}: RelatedQuestionsProps): ReactElement => {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null)
  const { t } = useTranslation('apps-watch')

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
        <div className="flex flex-wrap items-center justify-between mb-6 padded">
          <h4 className="flex items-center gap-4 text-sm xl:text-base 2xl:text-lg font-semibold tracking-wider uppercase text-red-100/70 flex-shrink-0 py-4">
            {t('Related questions')}
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
              className="inline-flex items-center gap-2 px-4 py-2 text-xs text-black font-bold uppercase tracking-wider rounded-full bg-white hover:bg-red-500 hover:text-white transition-colors duration-200 cursor-pointer flex-shrink-0"
            >
              <Icon
                name="MessageCircle"
                sx={{
                  width: 16,
                  height: 16
                }}
              />
              <span>{t('Ask yours')}</span>
            </button>
          </a>
        </div>

        <div className="relative">
          {questions.map((q, i) => (
            <Question
              key={i}
              question={q.value}
              isOpen={openQuestion === i}
              onToggle={() => handleQuestionToggle(i)}
            >
              {t(
                'Process what you learned -- Have a private discussion with someone who is ready to listen.'
              )}
            </Question>
          ))}
        </div>
      </div>
    </div>
  )
}
