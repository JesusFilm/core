import { sendGTMEvent } from '@next/third-parties/google'
import last from 'lodash/last'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import Bible from '@core/shared/ui/icons/Bible'
import LinkExternal from '@core/shared/ui/icons/LinkExternal'
import { ThemeMode } from '@core/shared/ui/themes'

import { VideoContentFields_studyQuestions as StudyQuestions } from '../../../__generated__/VideoContentFields'
import { useVideoChildren } from '../../libs/useVideoChildren'
import { getWatchUrl } from '../../libs/utils/getWatchUrl'
import { useVideo } from '../../libs/videoContext'
import type { VideoCarouselSlide } from '../../types/inserts'
import { ContentPageBlurFilter } from '../ContentPageBlurFilter'
import { DialogShare } from '../DialogShare'
import { PageWrapper } from '../PageWrapper'
import { VideoBlock } from '../VideoBlock'
import { VideoCarousel } from '../VideoCarousel'

import { BibleCitations } from './BibleCitations'
import { ContentMetadata } from './ContentMetadata'
import { DiscussionQuestions } from './DiscussionQuestions'
import { NewVideoContentHeader } from './NewVideoContentHeader'

export function PageSingleVideo(): ReactElement {
  const { t } = useTranslation('apps-watch')
  const {
    id,
    container,
    variant,
    title,
    description,
    snippet,
    images,
    imageAlt,
    label,
    studyQuestions,
    slug: videoSlug,
    bibleCitations,
    childrenCount
  } = useVideo()

  const [showShare, setShowShare] = useState(false)

  // State for managing current playing content (video or Mux insert)
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0)

  const variantSlug = container?.variant?.slug ?? variant?.slug
  const watchUrl = getWatchUrl(container?.slug, label, variant?.slug)
  const { children, loading } = useVideoChildren(
    variantSlug,
    variant?.language.bcp47 ?? 'en'
  )

  // Create slides from children only (no Mux inserts on single video page)
  const childrenSlides = useMemo<VideoCarouselSlide[]>(() => {
    if (loading || children.length === 0) return []
    return children.map((child) => ({
      source: 'video' as const,
      id: child.id,
      video: child
    }))
  }, [children, loading])

  // Determine the active video ID for the carousel
  // If current video is a container (not in children), select first child
  const activeVideoIdForCarousel = useMemo(() => {
    if (childrenSlides.length === 0) return id
    const currentVideoInChildren = childrenSlides.find(
      (slide) => slide.id === id
    )
    // If current video is not in children (it's a container), select first child
    return currentVideoInChildren?.id ?? childrenSlides[0]?.id ?? id
  }, [childrenSlides, id])

  // Sync currentSlideIndex with the current video when carousel loads or video changes
  useEffect(() => {
    if (childrenSlides.length > 0) {
      const currentVideoIndex = childrenSlides.findIndex(
        (slide) => slide.id === id
      )
      if (currentVideoIndex >= 0) {
        setCurrentSlideIndex(currentVideoIndex)
      } else {
        // If current video is not in children (container), select first child
        setCurrentSlideIndex(0)
      }
    }
  }, [childrenSlides, id])

  const makeDefaultQuestion = (value: string): StudyQuestions => ({
    __typename: 'VideoStudyQuestion',
    value,
    primary: false
  })

  const questions = useMemo<StudyQuestions[]>(() => {
    if (!studyQuestions?.length)
      return [
        makeDefaultQuestion(
          t(
            'If you could ask the creator of this video a question, what would it be?'
          )
        )
      ]

    const { nonPrimary, primary } = studyQuestions.reduce(
      (
        acc: { nonPrimary: StudyQuestions[]; primary: StudyQuestions[] },
        q: StudyQuestions
      ) => {
        if (q.primary === false) {
          acc.nonPrimary.push(q)
        } else if (q.primary === true) {
          acc.primary.push(q)
        }
        return acc
      },
      {
        nonPrimary: [],
        primary: []
      }
    )

    if (nonPrimary.length > 0) {
      return nonPrimary
    }

    if (primary.length > 0) {
      return primary
    }

    return [
      makeDefaultQuestion(
        t(
          'If you could ask the creator of this video a question, what would it be?'
        )
      )
    ]
  }, [studyQuestions, t])

  // Handle Mux insert completion - automatically progress to next item
  // Note: Mux inserts are not used on single video page, but callback is kept for VideoBlock compatibility
  const handleMuxInsertComplete = useCallback(() => {
    const nextIndex = currentSlideIndex + 1
    if (nextIndex < childrenSlides.length) {
      setCurrentSlideIndex(nextIndex)
    } else {
      setCurrentSlideIndex(0)
    }
  }, [currentSlideIndex, childrenSlides, id])

  const currentMuxInsert = null // Always null on single video page since we don't use Mux inserts

  const handleFreeResourceClick = () => {
    sendGTMEvent({
      event: 'join_study_button_click',
      eventId: uuidv4(),
      date: new Date().toISOString(),
      contentId: variantSlug
    })
    window.open(
      'https://join.bsfinternational.org/?utm_source=jesusfilm-watch',
      '_blank'
    )
  }

  return (
    <>
      <NextSeo
        title={last(title)?.value}
        description={last(snippet)?.value ?? undefined}
        openGraph={{
          type: 'website',
          title: last(title)?.value,
          url: `${
            process.env.NEXT_PUBLIC_WATCH_URL ??
            'https://watch-jesusfilm.vercel.app'
          }${watchUrl}`,
          description: last(snippet)?.value ?? undefined,
          images:
            last(images)?.mobileCinematicHigh != null
              ? [
                  {
                    url: last(images)?.mobileCinematicHigh ?? '',
                    width: 1080,
                    height: 600,
                    alt: last(imageAlt)?.value ?? '',
                    type: 'image/jpeg'
                  }
                ]
              : []
        }}
        facebook={
          process.env.NEXT_PUBLIC_FACEBOOK_APP_ID != null
            ? { appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID }
            : undefined
        }
        twitter={{
          site: '@YourNextStepIs',
          cardType: 'summary_large_image'
        }}
      />
      <PageWrapper
        hero={
          <VideoBlock
            currentMuxInsert={currentMuxInsert}
            onMuxInsertComplete={handleMuxInsertComplete}
          />
        }
        headerThemeMode={ThemeMode.dark}
        hideHeader
        hideFooter
        isFullscreen
      >
        <ContentPageBlurFilter>
          {(children.length > 0 ||
            (loading &&
              ((container?.childrenCount ?? 0) > 0 || childrenCount > 0))) && (
            <>
              <NewVideoContentHeader loading={loading} videos={children} />
              <VideoCarousel
                slides={childrenSlides}
                containerSlug={container?.slug ?? videoSlug}
                activeVideoId={activeVideoIdForCarousel}
                loading={loading}
              />
            </>
          )}
          <div
            data-testid="ContentPageContent"
            className="responsive-container z-10 flex flex-col gap-20 py-14"
          >
            <div className="z-10 grid grid-cols-1 gap-20 xl:grid-cols-[3fr_2fr]">
              <ContentMetadata
                title={last(title)?.value ?? ''}
                description={last(description)?.value ?? ''}
                label={label}
              />
              <DiscussionQuestions questions={questions} />
            </div>
            <div className="z-10 flex flex-row justify-between gap-2">
              <h3 className="text-sm font-semibold tracking-wider text-red-100/70 uppercase xl:text-base 2xl:text-lg">
                {t('Bible Quotes')}
              </h3>
              <div className="flex flex-row gap-2">
                <button
                  onClick={() => setShowShare(true)}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold tracking-wider text-gray-900 uppercase transition-colors duration-200 hover:bg-[#cb333b] hover:text-white"
                >
                  <LinkExternal className="h-4 w-4" />
                  {t('Share')}
                </button>
              </div>
              <DialogShare
                open={showShare}
                onClose={() => setShowShare(false)}
              />
            </div>
            <BibleCitations
              bibleCitations={bibleCitations}
              freeResource={{
                heading: t('Free Resources'),
                text: t(
                  'Want to grow deep in your understanding of the Bible?'
                ),
                cta: {
                  icon: Bible,
                  label: t('Join Our Bible Study'),
                  onClick: handleFreeResourceClick
                }
              }}
            />
          </div>
        </ContentPageBlurFilter>
      </PageWrapper>
    </>
  )
}
