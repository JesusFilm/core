import last from 'lodash/last'
import { NextSeo } from 'next-seo'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'

import { ThemeMode } from '@core/shared/ui/themes'

import { VideoLabel } from '../../../../__generated__/globalTypes'
import { useVideoChildren } from '../../libs/useVideoChildren'
import { getWatchUrl } from '../../libs/utils/getWatchUrl'
import { useVideo } from '../../libs/videoContext'
import { useWatch } from '../../libs/watchContext'
import type { VideoCarouselSlide } from '../../types/inserts'
import { ContentPageBlurFilter } from '../ContentPageBlurFilter'
import { PageWrapper } from '../PageWrapper'
import { SectionVideoGrid } from '../SectionVideoGrid'
import { VideoBlock } from '../VideoBlock'
import { VideoCarousel } from '../VideoCarousel'

import { ContentMetadata } from '../PageSingleVideo/ContentMetadata'
import { NewVideoContentHeader } from '../PageSingleVideo/NewVideoContentHeader'

export function PageCollectionVideo(): ReactElement {
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
    slug: videoSlug,
    childrenCount
  } = useVideo()
  const {
    state: { audioLanguageId }
  } = useWatch()

  const [isFullscreen, setIsFullscreen] = useState(false)

  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0)

  const collectionData = container ?? {
    id,
    title,
    description,
    snippet,
    images,
    imageAlt,
    label,
    childrenCount,
    slug: videoSlug,
    variant
  }

  const collectionTitle = last(collectionData.title)?.value ?? last(title)?.value
  const collectionDescription =
    last(collectionData.description)?.value ?? last(description)?.value ?? ''
  const collectionSnippet = last(collectionData.snippet)?.value ?? last(snippet)?.value
  const collectionImages = collectionData.images ?? images
  const collectionAlt = last(collectionData.imageAlt)?.value ?? last(imageAlt)?.value
  const collectionLabel = (collectionData.label ?? label) as VideoLabel
  const collectionSlug = collectionData.slug ?? videoSlug
  const collectionId = collectionData.id ?? id
  const collectionPoster = last(collectionImages)?.mobileCinematicHigh

  const variantSlug = collectionData.variant?.slug ?? variant?.slug
  const watchUrl = getWatchUrl(collectionSlug, collectionLabel, variantSlug)

  const { children, loading } = useVideoChildren(
    variantSlug,
    variant?.language.bcp47 ?? 'en'
  )

  const childrenSlides = useMemo<VideoCarouselSlide[]>(() => {
    if (loading || children.length === 0) return []
    return children.map((child) => ({
      source: 'video' as const,
      id: child.id,
      video: child
    }))
  }, [children, loading])

  const activeVideoIdForCarousel = useMemo(() => {
    if (childrenSlides.length === 0) return id
    const currentVideoInChildren = childrenSlides.find((slide) => slide.id === id)
    return currentVideoInChildren?.id ?? childrenSlides[0]?.id ?? id
  }, [childrenSlides, id])

  useEffect(() => {
    if (childrenSlides.length > 0) {
      const currentVideoIndex = childrenSlides.findIndex((slide) => slide.id === id)
      if (currentVideoIndex >= 0) {
        setCurrentSlideIndex(currentVideoIndex)
      } else {
        setCurrentSlideIndex(0)
      }
    }
  }, [childrenSlides, id])

  const handleMuxInsertComplete = useCallback(() => {
    const nextIndex = currentSlideIndex + 1
    if (nextIndex < childrenSlides.length) {
      setCurrentSlideIndex(nextIndex)
    } else {
      setCurrentSlideIndex(0)
    }
  }, [currentSlideIndex, childrenSlides, id])

  const currentMuxInsert = null

  return (
    <>
      <NextSeo
        title={collectionTitle}
        description={collectionSnippet ?? undefined}
        openGraph={{
          type: 'website',
          title: collectionTitle,
          url: `${
            process.env.NEXT_PUBLIC_WATCH_URL ??
            'https://watch-jesusfilm.vercel.app'
          }${watchUrl}`,
          description: collectionSnippet ?? undefined,
          images:
            collectionPoster != null
              ? [
                  {
                    url: collectionPoster,
                    width: 1080,
                    height: 600,
                    alt: collectionAlt ?? '',
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
            languageSelectorVariant="dropdown"
            posterImageUrl={collectionPoster ?? undefined}
          />
        }
        headerThemeMode={ThemeMode.dark}
        hideHeader
        hideFooter
        isFullscreen={isFullscreen}
      >
        <ContentPageBlurFilter>
          {(children.length > 0 ||
            (loading &&
              ((collectionData?.childrenCount ?? 0) > 0 || childrenCount > 0))) && (
            <>
              <NewVideoContentHeader loading={loading} videos={children} />
              <VideoCarousel
                slides={childrenSlides}
                containerSlug={collectionSlug ?? videoSlug}
                activeVideoId={activeVideoIdForCarousel}
                loading={loading}
              />
            </>
          )}
          <div
            data-testid="ContentPageContent"
            className="flex flex-col gap-16 py-14 z-10 responsive-container"
          >
            <div className="grid grid-cols-1 z-10 gap-10">
              <ContentMetadata
                title={collectionTitle ?? ''}
                description={collectionDescription}
                label={collectionLabel}
              />
            </div>
            <SectionVideoGrid
              primaryCollectionId={collectionId}
              languageId={audioLanguageId}
              showSequenceNumbers
            />
          </div>
        </ContentPageBlurFilter>
      </PageWrapper>
    </>
  )
}
