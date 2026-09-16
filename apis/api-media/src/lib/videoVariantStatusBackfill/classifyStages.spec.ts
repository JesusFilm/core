import { describe, expect, it } from 'vitest'

import {
  classifyVideoVariant,
  isGeneratedParentVariant
} from './classifyStages'
import type {
  ParentVideoForClassification,
  VideoForClassification,
  VideoVariantForClassification
} from './types'

function baseVariant(
  overrides: Partial<VideoVariantForClassification> = {}
): VideoVariantForClassification {
  return {
    id: 'variant-1',
    videoId: 'video-1',
    languageId: 'lang-1',
    edition: 'base',
    version: 1,
    published: true,
    hls: null,
    dash: null,
    share: null,
    masterUrl: null,
    duration: null,
    muxVideoId: null,
    assetId: null,
    brightcoveId: null,
    downloadable: true,
    downloads: [],
    muxVideoReadyToStream: null,
    ...overrides
  }
}

function baseVideo(
  overrides: Partial<VideoForClassification> = {}
): VideoForClassification {
  return {
    id: 'video-1',
    childIds: [],
    availableLanguages: [],
    ...overrides
  }
}

describe('isGeneratedParentVariant', () => {
  it('is true for a medialess Variant on a Video with children', () => {
    const variant = baseVariant()
    const video = baseVideo({ childIds: ['child-1'] })
    expect(isGeneratedParentVariant(variant, video)).toBe(true)
  })

  it('is false for a medialess Variant on a Video without children', () => {
    const variant = baseVariant()
    const video = baseVideo({ childIds: [] })
    expect(isGeneratedParentVariant(variant, video)).toBe(false)
  })

  it('is false for a Variant with real media even on a Video with children', () => {
    const variant = baseVariant({ hls: 'https://stream.example/a.m3u8' })
    const video = baseVideo({ childIds: ['child-1'] })
    expect(isGeneratedParentVariant(variant, video)).toBe(false)
  })
})

describe('classifyVideoVariant', () => {
  describe('generated parent Variants', () => {
    it('marks mux and downloads notApplicable, and parentSync/algolia tracked', () => {
      const variant = baseVariant({ languageId: '20770' })
      const video = baseVideo({
        childIds: ['child-1'],
        availableLanguages: ['20770']
      })

      const result = classifyVideoVariant(variant, video, [])

      expect(result.isGeneratedParentVariant).toBe(true)
      expect(result.stages.mux.state).toBe('notApplicable')
      expect(result.stages.downloads.state).toBe('notApplicable')
      expect(result.stages.parentSync.state).toBe('complete')
      expect(result.stages.algoliaVideo.state).toBe('unknown')
      expect(result.stages.algoliaVariant.state).toBe('unknown')
      // Algolia can never be verified from the database alone, so the
      // aggregate can never claim complete here -- degraded, not a
      // manufactured success, is the honest answer.
      expect(result.processingStatus).toBe('degraded')
    })

    it('marks parentSync failed when its own Video does not list the language', () => {
      const variant = baseVariant({ languageId: '20770' })
      const video = baseVideo({ childIds: ['child-1'], availableLanguages: [] })

      const result = classifyVideoVariant(variant, video, [])

      expect(result.stages.parentSync.state).toBe('failed')
      expect(result.processingStatus).toBe('degraded')
    })
  })

  describe('legacy Variants -- mux stage', () => {
    it('is complete when Mux reports readyToStream', () => {
      const variant = baseVariant({
        muxVideoId: 'mux-1',
        muxVideoReadyToStream: true
      })
      const result = classifyVideoVariant(variant, baseVideo(), [])
      expect(result.stages.mux.state).toBe('complete')
    })

    it('is unknown when a Mux video exists but is not ready -- never manufactured as success', () => {
      const variant = baseVariant({
        muxVideoId: 'mux-1',
        muxVideoReadyToStream: false
      })
      const result = classifyVideoVariant(variant, baseVideo(), [])
      expect(result.stages.mux.state).toBe('unknown')
    })

    it('is notApplicable when the Variant is sourced outside Mux', () => {
      const variant = baseVariant({ share: 'https://watch.example/a' })
      const result = classifyVideoVariant(variant, baseVideo(), [])
      expect(result.stages.mux.state).toBe('notApplicable')
    })

    it('is failed and the aggregate is failed when there is no usable media at all', () => {
      const variant = baseVariant()
      const result = classifyVideoVariant(variant, baseVideo(), [])
      expect(result.hasUsableMedia).toBe(false)
      expect(result.stages.mux.state).toBe('failed')
      expect(result.processingStatus).toBe('failed')
    })
  })

  describe('legacy Variants -- downloads stage', () => {
    it('is notApplicable when the Variant is not downloadable', () => {
      const variant = baseVariant({
        hls: 'https://stream.example/a.m3u8',
        downloadable: false
      })
      const result = classifyVideoVariant(variant, baseVideo(), [])
      expect(result.stages.downloads.state).toBe('notApplicable')
    })

    it('is complete when Download rows exist', () => {
      const variant = baseVariant({
        hls: 'https://stream.example/a.m3u8',
        downloadable: true,
        downloads: [{ id: 'download-1' }]
      })
      const result = classifyVideoVariant(variant, baseVideo(), [])
      expect(result.stages.downloads.state).toBe('complete')
    })

    it('is failed (verifiable absence) when downloadable but no Download rows exist', () => {
      const variant = baseVariant({
        hls: 'https://stream.example/a.m3u8',
        downloadable: true,
        downloads: []
      })
      const result = classifyVideoVariant(variant, baseVideo(), [])
      expect(result.stages.downloads.state).toBe('failed')
      expect(result.processingStatus).toBe('degraded')
    })
  })

  describe('legacy Variants -- parentSync stage', () => {
    it('is notApplicable when the Video has no parents', () => {
      const variant = baseVariant({
        hls: 'https://stream.example/a.m3u8',
        languageId: '20770'
      })
      const result = classifyVideoVariant(variant, baseVideo(), [])
      expect(result.stages.parentSync.state).toBe('notApplicable')
    })

    it('is complete when every parent lists the language', () => {
      const variant = baseVariant({
        hls: 'https://stream.example/a.m3u8',
        languageId: '20770'
      })
      const parents: ParentVideoForClassification[] = [
        { id: 'series-1', availableLanguages: ['20770'] }
      ]
      const result = classifyVideoVariant(variant, baseVideo(), parents)
      expect(result.stages.parentSync.state).toBe('complete')
    })

    it('is failed (verifiable gap) when a parent is missing the language', () => {
      const variant = baseVariant({
        hls: 'https://stream.example/a.m3u8',
        languageId: '20770'
      })
      const parents: ParentVideoForClassification[] = [
        { id: 'series-1', availableLanguages: [] }
      ]
      const result = classifyVideoVariant(variant, baseVideo(), parents)
      expect(result.stages.parentSync.state).toBe('failed')
      expect(result.processingStatus).toBe('degraded')
    })
  })

  describe('aggregate processingStatus', () => {
    it('never resolves complete via backfill, since algoliaVideo/algoliaVariant are always unknown', () => {
      const variant = baseVariant({
        hls: 'https://stream.example/a.m3u8',
        downloadable: false
      })
      const result = classifyVideoVariant(variant, baseVideo(), [])
      expect(result.stages.mux.state).toBe('notApplicable')
      expect(result.stages.downloads.state).toBe('notApplicable')
      expect(result.stages.parentSync.state).toBe('notApplicable')
      // Every other stage is notApplicable here -- only the two Algolia
      // stages are still "applicable" (never notApplicable), and they are
      // always unknown from a pure database read. So even a Variant with no
      // other work left to do lands degraded, not complete.
      expect(result.processingStatus).toBe('degraded')
    })

    it('is degraded, never failed, when a usable Variant has an incomplete stage', () => {
      const variant = baseVariant({
        muxVideoId: 'mux-1',
        muxVideoReadyToStream: true,
        downloadable: true,
        downloads: []
      })
      const result = classifyVideoVariant(variant, baseVideo(), [])
      expect(result.hasUsableMedia).toBe(true)
      expect(result.processingStatus).toBe('degraded')
    })
  })
})
