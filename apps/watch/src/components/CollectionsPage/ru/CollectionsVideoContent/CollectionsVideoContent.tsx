import { ReactElement } from 'react'

import { CollectionVideoPlayer } from '../../CollectionVideoPlayer'

import { BibleQuotesCarousel } from './BibleQuotesCarousel'
import { CollectionVideoContentDescription } from './CollectionVideoContentDescription'
import { Questions } from './Questions'
import { QuizButton } from './QuizButton'

interface BibleQuoteData {
  imageUrl: string
  bgColor: string
  author?: string
  text: string
}

interface QuestionData {
  id: number
  question: string
  answer: ReactElement | string
}

interface FreeResourceData {
  imageUrl: string
  bgColor: string
  title: string
  subtitle: string
  buttonText: string
}

interface VideoSectionProps {
  showDivider?: boolean
  contentId: string
  videoTitle?: string
  subtitle: string
  title: string
  description: string
  questions?: QuestionData[]
  questionsTitle?: string
  askButtonText?: string
  bibleQuotes?: BibleQuoteData[]
  bibleQuotesTitle?: string
  freeResource?: FreeResourceData
  onOpenDialog?: () => void
  mutePage?: boolean
  setMutePage?: (muted: boolean) => void
}

export const CollectionsVideoContent = ({
  showDivider = true,
  contentId,
  videoTitle = '',
  subtitle,
  title,
  description,
  questions = [],
  questionsTitle = 'Связанные вопросы',
  askButtonText = 'Задайте ваш',
  bibleQuotes = [],
  bibleQuotesTitle = 'Цитаты из Библии',
  freeResource,
  mutePage,
  setMutePage,
  onOpenDialog
}: VideoSectionProps): ReactElement => {
  return (
    <div className="px-4 pb-8">
      {showDivider && (
        <hr className="mb-18 border-t-2 border-t-black/70 border-b-1 border-b-white/5 inset-shadow-sm" />
      )}
      <CollectionVideoPlayer
        contentId={contentId}
        title={videoTitle}
        mutePage={mutePage}
        setMutePage={setMutePage}
      />
      <div className="xl:flex w-full z-1 relative">
        <CollectionVideoContentDescription
          subtitle={subtitle}
          title={title}
          description={description}
        />

        {questions.length > 0 && (
          <Questions
            questions={questions}
            questionsTitle={questionsTitle}
            askButtonText={askButtonText}
            onOpenDialog={onOpenDialog}
          />
        )}
      </div>

      {(bibleQuotes.length > 0 || freeResource) && (
        <>
          <BibleQuotesCarousel
            bibleQuotes={bibleQuotes}
            bibleQuotesTitle={bibleQuotesTitle}
            freeResource={freeResource}
            onOpenDialog={onOpenDialog}
          />
          <QuizButton />
        </>
      )}
    </div>
  )
}
