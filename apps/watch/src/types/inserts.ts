import type { VideoChildFields } from '../../__generated__/VideoChildFields'
import type { CarouselVideo } from '../components/VideoHero/libs/useCarouselVideos'

export interface InsertOverlay {
  label: string
  title: string
  collection: string
  description: string
  action?: InsertAction
}

export interface InsertAction {
  label: string
  url: string
}

export type InsertTrigger =
  | {
      type: 'sequence-start'
    }
  | {
      type: 'after-count'
      count: number
    }

export interface BaseInsertConfig {
  id: string
  enabled: boolean
  overlay: InsertOverlay
  trigger: InsertTrigger
  duration?: number
  posterOverride?: string
}

export interface MuxInsertConfig extends BaseInsertConfig {
  source: 'mux'
  playbackIds: [string, ...string[]]
}

export type InsertConfig = MuxInsertConfig

export interface VideoInsertConfig {
  version: string
  inserts: InsertConfig[]
}

export interface MuxPlaybackUrls {
  hls: string
  poster: string
  mp4?: {
    high?: string
    medium?: string
  }
}

export type CarouselVideoLike = CarouselVideo | VideoChildFields

export interface CarouselVideoSlide {
  source: 'video'
  id: string
  video: CarouselVideoLike
}

export interface CarouselMuxSlide {
  source: 'mux'
  id: string
  overlay: InsertOverlay
  playbackId: string
  playbackIndex: number
  urls: MuxPlaybackUrls
  duration?: number
  posterOverride?: string
}

export type VideoCarouselSlide = CarouselVideoSlide | CarouselMuxSlide

export function isMuxSlide(slide: VideoCarouselSlide): slide is CarouselMuxSlide {
  return slide.source === 'mux'
}

export function isVideoSlide(
  slide: VideoCarouselSlide
): slide is CarouselVideoSlide {
  return slide.source === 'video'
}

// Unified interface for both video cards and mux inserts
export interface UnifiedCardData {
  id: string
  title: string | string[]
  images: Array<{ mobileCinematicHigh: string }>
  imageAlt: Array<{ value: string }>
  label: string
  slug?: string
  variant?: { slug: string }
  // Mux-specific additions
  isMuxInsert?: boolean
  posterUrl?: string
  collection?: string
  customDuration?: number
}

// Transformation functions to convert different data types to unified format
export function transformMuxSlide(slide: CarouselMuxSlide): UnifiedCardData {
  return {
    id: slide.id,
    title: slide.overlay.title,
    images: [{ mobileCinematicHigh: slide.posterOverride ?? slide.urls.poster }],
    imageAlt: [{ value: slide.overlay.description }],
    label: slide.overlay.label,
    slug: slide.id, // Use ID as slug for mux inserts
    variant: { slug: slide.id },
    isMuxInsert: true,
    posterUrl: slide.posterOverride ?? slide.urls.poster,
    collection: slide.overlay.collection,
    customDuration: slide.duration
  }
}

export function transformVideoChild(video: VideoChildFields): UnifiedCardData {
  return {
    id: video.id,
    title: video.title,
    images: video.images,
    imageAlt: video.imageAlt,
    label: video.label,
    slug: video.slug,
    variant: video.variant,
    isMuxInsert: false
  }
}
