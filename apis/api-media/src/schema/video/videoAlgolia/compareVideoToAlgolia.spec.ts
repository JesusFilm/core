import {
  PRIMARY_VARIANT_LANGUAGE_ID,
  VideoForAlgoliaCompare,
  buildExpectedAlgoliaVideo,
  diffAlgoliaVideo
} from './compareVideoToAlgolia'

describe('compareVideoToAlgolia', () => {
  describe('PRIMARY_VARIANT_LANGUAGE_ID', () => {
    it('is the english language id used by the videos index', () => {
      expect(PRIMARY_VARIANT_LANGUAGE_ID).toBe('529')
    })
  })

  describe('buildExpectedAlgoliaVideo', () => {
    function makeVideo(
      overrides: Partial<VideoForAlgoliaCompare> = {}
    ): VideoForAlgoliaCompare {
      return {
        id: 'v1',
        label: 'episode',
        restrictViewPlatforms: [],
        keywords: [],
        variants: [],
        ...overrides
      }
    }

    it('marks a video with an HLS variant as content', () => {
      const expected = buildExpectedAlgoliaVideo(
        makeVideo({
          variants: [
            { hls: 'https://stream', lengthInMilliseconds: 1000, downloadable: true }
          ]
        })
      )
      expect(expected.componentType).toBe('content')
      expect(expected.contentType).toBe('video')
      expect(expected.lengthInMilliseconds).toBe(1000)
      expect(expected.isDownloadable).toBe(true)
    })

    it('marks a video without an HLS variant as a container', () => {
      const expected = buildExpectedAlgoliaVideo(makeVideo())
      expect(expected.componentType).toBe('container')
      expect(expected.contentType).toBe('none')
      expect(expected.lengthInMilliseconds).toBe(0)
      expect(expected.isDownloadable).toBe(false)
    })

    it('forces collections and series to be non-downloadable', () => {
      for (const label of ['collection', 'series']) {
        const expected = buildExpectedAlgoliaVideo(
          makeVideo({
            label,
            variants: [
              { hls: 'https://stream', lengthInMilliseconds: 0, downloadable: true }
            ]
          })
        )
        expect(expected.isDownloadable).toBe(false)
      }
    })

    it('flags arclight platform restriction', () => {
      const expected = buildExpectedAlgoliaVideo(
        makeVideo({ restrictViewPlatforms: ['arclight', 'web'] })
      )
      expect(expected.restrictViewArclight).toBe(true)
    })

    it('returns sorted keywords', () => {
      const expected = buildExpectedAlgoliaVideo(
        makeVideo({
          keywords: [{ value: 'beta' }, { value: 'alpha' }, { value: 'gamma' }]
        })
      )
      expect(expected.keywords).toEqual(['alpha', 'beta', 'gamma'])
    })
  })

  describe('diffAlgoliaVideo', () => {
    const baseExpected = {
      objectID: 'v1',
      mediaComponentId: 'v1',
      subType: 'episode',
      componentType: 'content',
      contentType: 'video',
      lengthInMilliseconds: 1000,
      isDownloadable: true,
      restrictViewArclight: false,
      keywords: ['alpha', 'beta']
    }

    it('returns no mismatches when records match', () => {
      expect(diffAlgoliaVideo(baseExpected, baseExpected)).toEqual([])
    })

    it('detects mismatched scalar fields', () => {
      const mismatches = diffAlgoliaVideo(baseExpected, {
        ...baseExpected,
        contentType: 'none'
      })
      expect(mismatches).toEqual([
        {
          field: 'contentType',
          expected: '"video"',
          actual: '"none"'
        }
      ])
    })

    it('treats keywords as a sorted set', () => {
      const mismatches = diffAlgoliaVideo(baseExpected, {
        ...baseExpected,
        keywords: ['beta', 'alpha']
      })
      expect(mismatches).toEqual([])
    })

    it('reports an empty-array actual when keywords are missing', () => {
      const mismatches = diffAlgoliaVideo(baseExpected, {
        ...baseExpected,
        keywords: undefined
      })
      expect(mismatches).toEqual([
        {
          field: 'keywords',
          expected: '["alpha","beta"]',
          actual: '[]'
        }
      ])
    })
  })
})
