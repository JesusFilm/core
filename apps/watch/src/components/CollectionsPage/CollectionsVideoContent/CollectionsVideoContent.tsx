import { ReactElement } from 'react'

import { CollectionVideoPlayer } from '../CollectionVideoPlayer'

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
  questionsTitle: string
  askButtonText: string
  bibleQuotes?: BibleQuoteData[]
  bibleQuotesTitle: string
  freeResource?: FreeResourceData
  onOpenDialog?: () => void
  mutePage?: boolean
  setMutePage?: (muted: boolean) => void
  quizButtonText: string
  shareButtonText: string
  shareDataTitle: string
  startAt?: number
}

export const CollectionsVideoContent = ({
  showDivider = true,
  contentId,
  videoTitle = '',
  subtitle,
  title,
  description,
  questions = [],
  questionsTitle,
  askButtonText,
  bibleQuotes = [],
  bibleQuotesTitle,
  freeResource,
  mutePage,
  setMutePage,
  onOpenDialog,
  quizButtonText,
  shareButtonText,
  shareDataTitle,
  startAt
}: VideoSectionProps): ReactElement => {
  return (
    <div id={contentId} className="scroll-snap-start-always relative py-16">
      {showDivider && <hr className="section-divider" />}
      <CollectionVideoPlayer
        contentId={contentId}
        title={videoTitle}
        mutePage={mutePage}
        setMutePage={setMutePage}
        startAt={startAt}
      />
      <div className="relative z-1 w-full xl:flex">
        <CollectionVideoContentDescription
          subtitle={subtitle}
          title={title}
          description={description}
        />
        {questions.length > 0 && (
          <Questions
            contentId={contentId}
            questions={questions}
            questionsTitle={questionsTitle}
            askButtonText={askButtonText}
          />
        )}
      </div>
      {(bibleQuotes.length > 0 || freeResource) && (
        <>
          <BibleQuotesCarousel
            contentId={contentId}
            bibleQuotes={bibleQuotes}
            bibleQuotesTitle={bibleQuotesTitle}
            freeResource={freeResource}
            onOpenDialog={onOpenDialog}
            shareButtonText={shareButtonText}
            shareDataTitle={shareDataTitle}
          />
          <QuizButton buttonText={quizButtonText} contentId={contentId} />
        </>
      )}
    </div>
  )
}
