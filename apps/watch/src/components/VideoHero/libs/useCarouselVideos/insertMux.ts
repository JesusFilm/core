import muxConfig from '../../../../../config/video-inserts.mux.json'

import { buildPlaybackUrls } from '../../../../lib/mux/buildPlaybackUrls'
import { pickPlaybackId } from '../../../../lib/mux/pickPlaybackId'
import { parseInsertMuxConfig } from '../../../../lib/validation/insertMux.schema'
import {
  type CarouselMuxSlide,
  type CarouselVideoSlide,
  type CarouselVideoLike,
  type VideoCarouselSlide,
  type InsertConfig,
  type MuxInsertConfig
} from '../../../../types/inserts'

const STORAGE_KEY = 'mux-insert-selections'

const config = parseInsertMuxConfig(muxConfig)

interface MergeOptions {
  seed?: string
}

export function mergeMuxInserts(
  videos: CarouselVideoLike[],
  options: MergeOptions = {}
): VideoCarouselSlide[] {
  const slides: VideoCarouselSlide[] = []
  const enabledInserts = config.inserts.filter((insert) => insert.enabled)

  if (enabledInserts.length === 0) {
    return videos.map(convertVideoToSlide)
  }

  const seed = options.seed ?? getSessionSeed()
  const preparedSlides = new Map<string, CarouselMuxSlide>()
  const inserted = new Set<string>()

  const sequenceStart = enabledInserts.filter(
    (insert) => insert.trigger.type === 'sequence-start'
  )

  sequenceStart.forEach((insert) => {
    const slide = prepareSlide(insert, seed, preparedSlides)
    slides.push(slide)
    inserted.add(insert.id)
  })

  const afterCount = enabledInserts.filter(
    (insert): insert is MuxInsertConfig & { trigger: { type: 'after-count'; count: number } } =>
      insert.trigger.type === 'after-count'
  )

  videos.forEach((video, index) => {
    slides.push(convertVideoToSlide(video))

    afterCount.forEach((insert) => {
      if (inserted.has(insert.id)) return
      if (index + 1 < insert.trigger.count) return

      const slide = prepareSlide(insert, seed, preparedSlides)
      slides.push(slide)
      inserted.add(insert.id)
    })
  })

  console.log(`[DURATION] Final carousel: ${slides.length} slides total`)
  return slides
}

function convertVideoToSlide(video: CarouselVideoLike): CarouselVideoSlide {
  return {
    source: 'video',
    id: video.id,
    video
  }
}

function prepareSlide(
  insert: InsertConfig,
  seed: string | undefined,
  cache: Map<string, CarouselMuxSlide>
): CarouselMuxSlide {
  const cached = cache.get(insert.id)
  if (cached != null) return cached

  const playbackId = selectPlaybackId(insert, seed)
  const urls = buildPlaybackUrls(playbackId.playbackId)

  const slide: CarouselMuxSlide = {
    source: 'mux',
    id: insert.id,
    overlay: insert.overlay,
    playbackId: playbackId.playbackId,
    playbackIndex: playbackId.index,
    urls,
    duration: insert.duration,
    posterOverride: insert.posterOverride
  }

  console.log(`[DURATION] Created Mux slide: ${insert.id} with ${insert.duration}s duration`)
  cache.set(insert.id, slide)

  return slide
}

function selectPlaybackId(
  insert: InsertConfig,
  seed: string | undefined
): { playbackId: string; index: number } {
  const stored = getStoredPlayback(insert.id)
  if (stored != null) {
    const index = insert.playbackIds.indexOf(stored)
    if (index >= 0) {
      return { playbackId: stored, index }
    }
  }

  const result = pickPlaybackId(insert.playbackIds, {
    seed: seed != null ? `${seed}:${insert.id}` : insert.id
  })

  storePlayback(insert.id, result.playbackId)

  return result
}

function getSessionSeed(): string | undefined {
  if (typeof window === 'undefined') return undefined

  try {
    const existing = sessionStorage.getItem(`${STORAGE_KEY}-seed`)
    if (existing != null) return existing

    const seed = generateSessionSeed()
    sessionStorage.setItem(`${STORAGE_KEY}-seed`, seed)
    return seed
  } catch (error) {
    return undefined
  }
}

function generateSessionSeed(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function getStoredPlayback(insertId: string): string | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw == null) return null

    const parsed = JSON.parse(raw) as Record<string, string>
    return parsed[insertId] ?? null
  } catch (error) {
    return null
  }
}

function storePlayback(insertId: string, playbackId: string): void {
  if (typeof window === 'undefined') return

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    const parsed = raw != null ? (JSON.parse(raw) as Record<string, string>) : {}
    parsed[insertId] = playbackId
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
  } catch (error) {
    // Ignore storage errors (e.g. Safari private mode)
  }
}
