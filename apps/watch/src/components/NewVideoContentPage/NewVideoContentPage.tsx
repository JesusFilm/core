import { sendGTMEvent } from '@next/third-parties/google'
import last from 'lodash/last'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement, useMemo, useState, useCallback, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

import Bible from '@core/shared/ui/icons/Bible'
import LinkExternal from '@core/shared/ui/icons/LinkExternal'
import { ThemeMode } from '@core/shared/ui/themes'

import { VideoContentFields_studyQuestions as StudyQuestions } from '../../../__generated__/VideoContentFields'
import { useVideoChildren } from '../../libs/useVideoChildren'
import { getWatchUrl } from '../../libs/utils/getWatchUrl'
import { useVideo } from '../../libs/videoContext'
import { mergeMuxInserts } from '../VideoHero/libs/useCarouselVideos/insertMux'
import type { VideoCarouselSlide, CarouselMuxSlide } from '../../types/inserts'
import { PageWrapper } from '../PageWrapper'
import { ShareDialog } from '../ShareDialog'

import { BibleCitations } from './BibleCitations'
import { ContentMetadata } from './ContentMetadata'
import { ContentPageBlurFilter } from './ContentPageBlurFilter'
import { DiscussionQuestions } from './DiscussionQuestions'
import { NewVideoContentHeader } from './NewVideoContentHeader'
import { VideoCarousel } from './VideoCarousel'
import { VideoContentHero } from './VideoContentHero'

export function NewVideoContentPage(): ReactElement {
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
  const [isFullscreen, setIsFullscreen] = useState(false)

  // State for managing current playing content (video or Mux insert)
  const [currentPlayingId, setCurrentPlayingId] = useState<string>(id) // Default to main video
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0)

  const variantSlug = container?.variant?.slug ?? variant?.slug
  const watchUrl = getWatchUrl(container?.slug, label, variant?.slug)
  const { children, loading } = useVideoChildren(
    variantSlug,
    variant?.language.bcp47 ?? 'en'
  )

  // Merge Mux inserts with video children to create carousel slides
  const carouselSlides = useMemo<VideoCarouselSlide[]>(() => {
    if (loading || children.length === 0) return []
    return mergeMuxInserts(children)
  }, [children, loading])

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

  // Handle video/insert selection from carousel
  const handleVideoSelect = useCallback((videoId: string) => {
    setCurrentPlayingId(videoId)
    const slideIndex = carouselSlides.findIndex(slide => slide.id === videoId)
    if (slideIndex >= 0) {
      setCurrentSlideIndex(slideIndex)
    }
  }, [carouselSlides])

  // Handle slide change for duration tracking
  const handleSlideChange = useCallback((activeIndex: number) => {
    setCurrentSlideIndex(activeIndex)
    if (carouselSlides[activeIndex]) {
      setCurrentPlayingId(carouselSlides[activeIndex].id)
    }
  }, [carouselSlides])

  // Handle Mux insert completion - automatically progress to next item
  const handleMuxInsertComplete = useCallback(() => {
    console.log('[DURATION] Mux insert completed - progressing to next slide')

    const nextIndex = currentSlideIndex + 1
    if (nextIndex < carouselSlides.length) {
      console.log(`[DURATION] Moving to slide ${nextIndex}/${carouselSlides.length}`)
      setCurrentSlideIndex(nextIndex)
      setCurrentPlayingId(carouselSlides[nextIndex].id)
    } else {
      console.log('[DURATION] At end, looping back to start')
      setCurrentSlideIndex(0)
      setCurrentPlayingId(carouselSlides[0]?.id || id)
    }
  }, [currentSlideIndex, carouselSlides, id])

  // Get current playing content
  const currentSlide = carouselSlides[currentSlideIndex]
  const currentMuxInsert = currentSlide?.source === 'mux' ? currentSlide : null

  // Debug current content
  useEffect(() => {
    if (carouselSlides.length > 0) {
      const currentSlideInfo = currentSlide ? `${currentSlide.source}:${currentSlide.id}` : 'none'
      console.log(`[DURATION] Current slide ${currentSlideIndex}/${carouselSlides.length}: ${currentSlideInfo}`)

      if (currentMuxInsert) {
        console.log(`[DURATION] Active Mux insert: ${currentMuxInsert.id} (${currentMuxInsert.duration}s)`)
      }
    }
  }, [currentSlideIndex, currentSlide, currentMuxInsert, carouselSlides.length])

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
        hero={<VideoContentHero currentMuxInsert={currentMuxInsert} onMuxInsertComplete={handleMuxInsertComplete} />}
        headerThemeMode={ThemeMode.dark}
        hideHeader
        hideFooter
        isFullscreen={isFullscreen}
      >
        <ContentPageBlurFilter>
          <NewVideoContentHeader loading={loading} videos={children} />
          {((container?.childrenCount ?? 0) > 0 || childrenCount > 0) &&
            (carouselSlides.length > 0 || loading) && (
              <VideoCarousel
                slides={carouselSlides}
                containerSlug={container?.slug ?? videoSlug}
                activeVideoId={currentPlayingId}
                loading={loading}
                onVideoSelect={handleVideoSelect}
                onSlideChange={handleSlideChange}
              />
            )}
          <div
            data-testid="ContentPageContent"
            className="flex flex-col gap-20 py-20 z-10 responsive-container"
          >
            <div className="grid grid-cols-1 xl:grid-cols-[3fr_2fr] z-10 gap-20">
              <ContentMetadata
                title={last(title)?.value ?? ''}
                description={last(description)?.value ?? ''}
                label={label}
              />
              <DiscussionQuestions questions={questions} />
            </div>
            <div className="z-10 flex flex-row gap-2 justify-between">
              <h3 className="text-sm xl:text-base 2xl:text-lg font-semibold tracking-wider uppercase text-red-100/70">
                {t('Bible Quotes')}
              </h3>
              <div className="flex flex-row gap-2">
                <button
                  onClick={() => setShowShare(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-gray-900 font-bold uppercase tracking-wider bg-white hover:bg-[#cb333b] hover:text-white transition-colors duration-200 text-sm cursor-pointer"
                >
                  <LinkExternal className="w-4 h-4" />
                  {t('Share')}
                </button>
              </div>
              <ShareDialog
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
