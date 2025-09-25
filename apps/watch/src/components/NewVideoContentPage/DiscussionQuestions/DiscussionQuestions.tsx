import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useMemo, useState } from 'react'

import MessageCircle from '@core/shared/ui/icons/MessageCircle'

import { VideoContentFields_studyQuestions } from '../../../../__generated__/VideoContentFields'
import { cn } from '../../../libs/cn'
import { SharingIdeasWall } from '../../SharingIdeasWall'

import { Question } from './Question'

interface DiscussionQuestionProps {
  questions: VideoContentFields_studyQuestions[]
}

export function DiscussionQuestions({
  questions
}: DiscussionQuestionProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const [activeTab, setActiveTab] = useState<'discussion' | 'sharing'>(
    'discussion'
  )

  useEffect(() => {
    setActiveTab('discussion')
  }, [questions])

  const ideaTexts = useMemo(() => {
    const values = questions
      .map((question) => question.value)
      .filter((value): value is string => value != null && value.length > 0)

    if (values.length > 0) return values

    return [
      t('If you could ask the creator of this video a question, what would it be?')
    ]
  }, [questions, t])

  return (
    <div data-testid="ContentDiscussionQuestions">
      <div className="pt-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 px-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <h2 className="text-sm font-semibold tracking-wider text-red-100/70 uppercase xl:text-base 2xl:text-lg">
              {activeTab === 'discussion'
                ? t('Related questions')
                : t('Sharing Ideas')}
            </h2>
            <div
              role="tablist"
              aria-label={t('Discussion Questions')}
              className="inline-flex rounded-full bg-white/10 p-1 text-xs font-bold uppercase tracking-wider"
            >
              <button
                type="button"
                id="content-discussion-tab"
                role="tab"
                aria-controls="content-discussion-panel"
                aria-selected={activeTab === 'discussion'}
                onClick={() => setActiveTab('discussion')}
                className={cn(
                  'rounded-full px-4 py-2 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
                  activeTab === 'discussion'
                    ? 'bg-white text-gray-900 shadow-lg shadow-black/10'
                    : 'text-white/70 hover:text-white'
                )}
              >
                {t('Related questions')}
              </button>
              <button
                type="button"
                id="content-sharing-tab"
                role="tab"
                aria-controls="content-sharing-panel"
                aria-selected={activeTab === 'sharing'}
                onClick={() => setActiveTab('sharing')}
                className={cn(
                  'rounded-full px-4 py-2 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
                  activeTab === 'sharing'
                    ? 'bg-white text-gray-900 shadow-lg shadow-black/10'
                    : 'text-white/70 hover:text-white'
                )}
              >
                {t('Sharing Ideas')}
              </button>
            </div>
          </div>
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
          <div
            id="content-discussion-panel"
            role="tabpanel"
            aria-labelledby="content-discussion-tab"
            hidden={activeTab !== 'discussion'}
          >
            <Question questions={questions} />
          </div>
          <div
            id="content-sharing-panel"
            role="tabpanel"
            aria-labelledby="content-sharing-tab"
            hidden={activeTab !== 'sharing'}
            className="pb-2"
          >
            <SharingIdeasWall ideas={ideaTexts} />
          </div>
        </div>
      </div>
    </div>
  )
}
