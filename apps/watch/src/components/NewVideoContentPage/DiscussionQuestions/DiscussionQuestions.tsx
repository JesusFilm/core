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
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 px-2">
          <h2 className="text-sm font-semibold tracking-wider text-red-100/70 uppercase xl:text-base 2xl:text-lg">
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
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold tracking-wider text-gray-900 uppercase transition-colors duration-200 hover:bg-[#cb333b] hover:text-white"
            >
              <MessageCircle className="h-4 w-4" />
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
