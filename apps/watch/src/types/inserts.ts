import type { VideoChildFields } from '../../__generated__/VideoChildFields'
import type { CarouselVideo } from '../components/VideoHero/libs/useCarouselVideos'

export interface InsertOverlay {
  label: string
  title: string
  collection: string
  description: string
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
