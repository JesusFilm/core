import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import Mail1 from '@core/shared/ui/icons/Mail1'
import MessageCircle from '@core/shared/ui/icons/MessageCircle'

import { VideoContentFields_studyQuestions } from '../../../../__generated__/VideoContentFields'

import { Question } from './Question'

interface DiscussionQuestionProps {
  questions: VideoContentFields_studyQuestions[]
}

export function DiscussionQuestions({
  questions
}: DiscussionQuestionProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const [openQuestion, setOpenQuestion] = useState<number | null>(null)

  const handleQuestionToggle = (idx: number): void => {
    setOpenQuestion(openQuestion === idx ? null : idx)
  }

  return (
    <div data-testid="ContentDiscussionQuestions">
      <div className="pt-4">
        <div className="flex flex-wrap items-center justify-between mb-6 px-2">
          <h2 className="text-sm xl:text-base 2xl:text-lg font-semibold tracking-wider uppercase text-red-100/70">
            {t('Related questions')}
          </h2>
          <a
            href="https://issuesiface.com/talk?utm_source=jesusfilm-watch"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button
              data-testid="AskQuestionButton"
              aria-label={t('Ask a question')}
              tabIndex={0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-gray-900 font-bold text-xs uppercase tracking-wider transition-colors duration-200 hover:bg-[#cb333b] hover:text-white cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              {t('Ask yours')}
            </button>
          </a>
        </div>

        <div className="relative">
          {questions.map((q, i) => (
            <Question
              key={i}
              question={q.value}
              isOpen={i === openQuestion}
              onToggle={() => handleQuestionToggle(i)}
              answer={
                <>
                  {t(
                    'Have a private discussion with someone who is ready to listen.'
                  )}
                  <div className="pt-4">
                    <button
                      onClick={() =>
                        window.open(
                          'https://chataboutjesus.com/chat/?utm_source=jesusfilm-watch',
                          '_blank'
                        )
                      }
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-gray-900 font-bold text-xs uppercase tracking-wider transition-colors duration-200 hover:bg-[#cb333b] hover:text-white cursor-pointer mr-4"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {t('Chat with a person')}
                    </button>
                    <button
                      onClick={() =>
                        window.open(
                          'https://www.everystudent.com/contact.php?utm_source=jesusfilm-watch',
                          '_blank'
                        )
                      }
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-gray-900 font-bold text-xs uppercase tracking-wider transition-colors duration-200 hover:bg-[#cb333b] hover:text-white cursor-pointer"
                    >
                      <Mail1 className="w-4 h-4" />
                      {t('Ask a Bible question')}
                    </button>
                  </div>
                </>
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
}
