import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

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
          <Question questions={questions} />
        </div>
      </div>
    </div>
  )
}
