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
  shareDataTitle
}: VideoSectionProps): ReactElement => {
  return (
    <div id={contentId} className="py-16 relative">
      {showDivider && <hr className="section-divider" />}
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
            shareButtonText={shareButtonText}
            shareDataTitle={shareDataTitle}
          />
          <QuizButton buttonText={quizButtonText} />
        </>
      )}
    </div>
  )
}
