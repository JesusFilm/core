import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { VideoLabel } from '../../../__generated__/globalTypes'
import {
  type VideoContentFields,
  type VideoContentFields_description,
  type VideoContentFields_imageAlt,
  type VideoContentFields_images,
  type VideoContentFields_snippet,
  type VideoContentFields_title,
  type VideoContentFields_variant,
  type VideoContentFields_variant_language
} from '../../../__generated__/VideoContentFields'
import { usePlayer } from '../../libs/playerContext'
import {
  type CarouselMuxSlide,
  type CarouselVideoLike,
  type CarouselVideoSlide,
  type VideoCarouselSlide,
  isMuxSlide,
  isVideoSlide
} from '../../types/inserts'
import {
  type CarouselVideo,
  useCarouselVideos
} from '../VideoHero/libs/useCarouselVideos'

interface UseWatchHeroCarouselOptions {
  locale?: string
}

interface UseWatchHeroCarouselResult {
  loading: boolean
  slides: VideoCarouselSlide[]
  activeVideoId?: string
  activeVideo: VideoContentFields | null
  currentMuxInsert: CarouselMuxSlide | null
  handleVideoSelect: (slideId: string) => void
  handleMuxInsertComplete: () => void
}

const DEFAULT_LANGUAGE: VideoContentFields_variant_language = {
  __typename: 'Language',
  id: '529',
  name: [
    {
      __typename: 'LanguageName',
      value: 'English',
      primary: true
    }
  ],
  bcp47: 'en'
}

function toVideoTitles(
  video: CarouselVideoLike
): VideoContentFields_title[] {
  const fallback = (video as CarouselVideo).slug ?? video.id
  const titles = (video as any).title

  if (Array.isArray(titles) && titles.length > 0) {
    return titles.map((title: any) => ({
      __typename: 'VideoTitle',
      value: title?.value ?? fallback
    }))
  }

  return [
    {
      __typename: 'VideoTitle',
      value: fallback
    }
  ]
}

function toImages(video: CarouselVideoLike): VideoContentFields_images[] {
  const images = (video as any).images

  if (!Array.isArray(images)) return []

  return images.map((image: any) => ({
    __typename: 'CloudflareImage',
    mobileCinematicHigh: image?.mobileCinematicHigh ?? null
  }))
}

function toImageAlts(
  video: CarouselVideoLike,
  fallbackTitle: string
): VideoContentFields_imageAlt[] {
  const imageAlt = (video as any).imageAlt

  if (!Array.isArray(imageAlt) || imageAlt.length === 0) {
    return [
      {
        __typename: 'VideoImageAlt',
        value: fallbackTitle
      }
    ]
  }

  return imageAlt.map((alt: any) => ({
    __typename: 'VideoImageAlt',
    value: alt?.value ?? fallbackTitle
  }))
}

function toSnippets(video: CarouselVideoLike): VideoContentFields_snippet[] {
  const snippets = (video as any).snippet

  if (!Array.isArray(snippets)) return []

  return snippets.map((snippet: any) => ({
    __typename: 'VideoSnippet',
    value: snippet?.value ?? ''
  }))
}

function toDescriptions(
  video: CarouselVideoLike
): VideoContentFields_description[] {
  const descriptions = (video as any).description

  if (!Array.isArray(descriptions)) return []

  return descriptions.map((description: any) => ({
    __typename: 'VideoDescription',
    value: description?.value ?? ''
  }))
}

function mapVideoLabel(label: string | undefined): VideoLabel {
  if (!label) return VideoLabel.shortFilm
  const values = Object.values(VideoLabel)
  return (values.includes(label as VideoLabel)
    ? (label as VideoLabel)
    : VideoLabel.shortFilm)
}

function toVariant(video: CarouselVideoLike): VideoContentFields_variant | null {
  const variant = (video as any).variant

  if (!variant) return null

  const { id, duration, hls, slug } = variant

  if (!id || typeof duration !== 'number' || !slug) return null

  const language = variant.language ?? DEFAULT_LANGUAGE

  return {
    __typename: 'VideoVariant',
    id,
    duration,
    hls: hls ?? null,
    downloadable: Boolean(variant.downloadable),
    downloads: Array.isArray(variant.downloads)
      ? variant.downloads.map((download: any) => ({
          __typename: 'VideoVariantDownload',
          quality: download?.quality,
          size: download?.size ?? 0,
          url: download?.url ?? ''
        }))
      : [],
    language: {
      __typename: 'Language',
      id: language?.id ?? DEFAULT_LANGUAGE.id,
      name: Array.isArray(language?.name) && language.name.length > 0
        ? language.name.map((name: any) => ({
            __typename: 'LanguageName',
            value: name?.value ?? DEFAULT_LANGUAGE.name[0].value,
            primary: name?.primary ?? true
          }))
        : DEFAULT_LANGUAGE.name,
      bcp47: language?.bcp47 ?? DEFAULT_LANGUAGE.bcp47
    },
    slug,
    subtitleCount: variant.subtitleCount ?? 0
  }
}

function createVideoContentFromVideo(
  slide: CarouselVideoSlide
): VideoContentFields {
  const video = slide.video
  const title = toVideoTitles(video)
  const primaryTitle = title[0]?.value ?? video.id

  return {
    __typename: 'Video',
    id: video.id,
    slug: (video as any).slug ?? video.id,
    label: mapVideoLabel((video as any).label),
    title,
    images: toImages(video),
    imageAlt: toImageAlts(video, primaryTitle),
    snippet: toSnippets(video),
    description: toDescriptions(video),
    studyQuestions: [],
    bibleCitations: [],
    variant: toVariant(video),
    variantLanguagesCount: (video as any).variantLanguagesCount ?? 1,
    childrenCount: (video as any).childrenCount ?? 0
  }
}

function createVideoContentFromMux(
  slide: CarouselMuxSlide
): VideoContentFields {
  const title = slide.overlay.title
  const poster = slide.posterOverride ?? slide.urls.poster

  return {
    __typename: 'Video',
    id: slide.id,
    slug: slide.id,
    title: [
      {
        __typename: 'VideoTitle',
        value: title
      }
    ],
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh: poster
      }
    ],
    imageAlt: [
      {
        __typename: 'VideoImageAlt',
        value: title
      }
    ],
    snippet: [],
    description: [
      {
        __typename: 'VideoDescription',
        value: slide.overlay.description
      }
    ],
    studyQuestions: [],
    bibleCitations: [],
    label: mapVideoLabel(slide.overlay.label),
    variant: {
      __typename: 'VideoVariant',
      id: `${slide.id}-variant`,
      duration: slide.duration ?? 0,
      hls: slide.urls.hls,
      downloadable: false,
      downloads: [],
      language: DEFAULT_LANGUAGE,
      slug: `${slide.id}/variant`,
      subtitleCount: 0
    },
    variantLanguagesCount: 1,
    childrenCount: 0
  }
}

export function useWatchHeroCarousel({
  locale
}: UseWatchHeroCarouselOptions = {}): UseWatchHeroCarouselResult {
  const {
    slides: rawSlides,
    loading,
    moveToNext,
    jumpToVideo
  } = useCarouselVideos(locale)
  const { state: playerState } = usePlayer()

  const [slides, setSlides] = useState<VideoCarouselSlide[]>(rawSlides)
  const [activeSlideId, setActiveSlideId] = useState<string | null>(null)
  const [lastProgress, setLastProgress] = useState(0)
  const [isProgressing, setIsProgressing] = useState(false)
  const autoProgressEnabled = true
  const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setSlides((previousSlides) => {
      if (previousSlides === rawSlides) return previousSlides

      const previousByKey = new Map(
        previousSlides.map((slide) => [`${slide.source}:${slide.id}`, slide])
      )

      const nextSlides = rawSlides.map((slide) => {
        const key = `${slide.source}:${slide.id}`
        const previousSlide = previousByKey.get(key)

        if (
          previousSlide != null &&
          isMuxSlide(slide) &&
          isMuxSlide(previousSlide) &&
          previousSlide.playbackId === slide.playbackId &&
          previousSlide.playbackIndex === slide.playbackIndex
        ) {
          return previousSlide
        }

        if (
          previousSlide != null &&
          isVideoSlide(slide) &&
          isVideoSlide(previousSlide) &&
          previousSlide.video === slide.video
        ) {
          return previousSlide
        }

        return slide
      })

      const isSameLength = nextSlides.length === previousSlides.length

      if (
        isSameLength &&
        nextSlides.every((slide, index) => slide === previousSlides[index])
      ) {
        return previousSlides
      }

      return nextSlides
    })
  }, [rawSlides])

  useEffect(() => {
    return () => {
      if (resetRef.current != null) clearTimeout(resetRef.current)
    }
  }, [])

  useEffect(() => {
    if (slides.length === 0) {
      setActiveSlideId(null)
      return
    }

    if (activeSlideId == null) {
      setActiveSlideId(slides[0]?.id ?? null)
      return
    }

    if (!slides.some((slide) => slide.id === activeSlideId)) {
      setActiveSlideId(slides[0]?.id ?? null)
    }
  }, [slides, activeSlideId])

  const activeSlide = useMemo(() => {
    if (activeSlideId == null) return slides[0] ?? null
    return slides.find((slide) => slide.id === activeSlideId) ?? null
  }, [activeSlideId, slides])

  const activeVideoId = activeSlide?.id

  const activeSlideIndex = useMemo(() => {
    if (!activeSlide) return -1
    return slides.findIndex((slide) => slide.id === activeSlide.id)
  }, [slides, activeSlide])

  const scheduleReset = useCallback((delay: number) => {
    if (resetRef.current != null) clearTimeout(resetRef.current)
    resetRef.current = setTimeout(() => {
      setIsProgressing(false)
    }, delay)
  }, [])

  useEffect(() => {
    setLastProgress(0)
    if (activeVideoId != null) {
      scheduleReset(500)
    }
  }, [activeVideoId, scheduleReset])

  const handleVideoSelect = useCallback(
    (slideId: string) => {
      const nextSlide = slides.find((slide) => slide.id === slideId)
      if (!nextSlide) return

      setActiveSlideId(slideId)
      setIsProgressing(false)

      if (isVideoSlide(nextSlide)) {
        const jumped = jumpToVideo(slideId)
        if (!jumped) {
          moveToNext()
        }
      }
    },
    [slides, jumpToVideo, moveToNext]
  )

  const moveToSlide = useCallback(
    (index: number, resetDelay: number) => {
      const nextSlide = slides[index]
      if (!nextSlide) return

      setIsProgressing(true)
      setActiveSlideId(nextSlide.id)

      if (isVideoSlide(nextSlide)) {
        const jumped = jumpToVideo(nextSlide.id)
        if (!jumped) {
          moveToNext()
        }
      } else {
        moveToNext()
      }

      scheduleReset(resetDelay)
    },
    [slides, jumpToVideo, moveToNext, scheduleReset]
  )

  const handleMuxInsertComplete = useCallback(() => {
    if (!autoProgressEnabled || isProgressing || activeSlideIndex === -1) {
      return
    }

    const nextIndex = activeSlideIndex + 1
    const nextSlide = slides[nextIndex]
    if (!nextSlide) return

    setIsProgressing(true)
    setActiveSlideId(nextSlide.id)

    if (isVideoSlide(nextSlide)) {
      const jumped = jumpToVideo(nextSlide.id)
      if (!jumped) {
        moveToNext()
      }
    }

    scheduleReset(500)
  }, [
    activeSlideIndex,
    autoProgressEnabled,
    isProgressing,
    slides,
    jumpToVideo,
    moveToNext,
    scheduleReset
  ])

  const advanceOnProgress = useCallback(() => {
    if (!autoProgressEnabled || isProgressing || activeSlideIndex === -1) {
      return
    }

    moveToSlide(activeSlideIndex + 1, 2000)
    setLastProgress(0)
  }, [
    activeSlideIndex,
    autoProgressEnabled,
    isProgressing,
    moveToSlide
  ])

  useEffect(() => {
    if (playerState.progress >= 95 && lastProgress < 95 && !isProgressing) {
      advanceOnProgress()
    }

    setLastProgress(playerState.progress)
  }, [
    playerState.progress,
    lastProgress,
    advanceOnProgress,
    isProgressing
  ])

  const currentMuxInsert = useMemo(() => {
    if (activeSlide && isMuxSlide(activeSlide)) {
      return activeSlide
    }
    return null
  }, [activeSlide])

  const activeVideo: VideoContentFields | null = useMemo(() => {
    if (!activeSlide) return null
    if (isMuxSlide(activeSlide)) {
      return createVideoContentFromMux(activeSlide)
    }
    if (isVideoSlide(activeSlide)) {
      return createVideoContentFromVideo(activeSlide)
    }
    return null
  }, [activeSlide])

  return {
    loading,
    slides,
    activeVideoId,
    activeVideo,
    currentMuxInsert,
    handleVideoSelect,
    handleMuxInsertComplete
  }
}
