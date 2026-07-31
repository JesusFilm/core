import {
  VIDEO_SUBTITLE_CHECKSUM_VERSION,
  buildVideoSubtitleChecksumManifest,
  serializeVideoSubtitleChecksumBucket,
  serializeVideoSubtitleChecksumRoot,
  type VideoSubtitleChecksumSourceRecord
} from './videoSubtitleChecksum'

const GOLDEN_SOURCE: VideoSubtitleChecksumSourceRecord = {
  id: 'subtitle-1',
  videoId: 'video-1',
  languageId: '529',
  edition: 'base',
  primary: true,
  vttSrc: 'https://cdn.example/sub.vtt',
  vttVersion: 3,
  srtSrc: null,
  srtVersion: 1
}

const GOLDEN_VIDEO_CANONICAL =
  '["jfp.subtitle-sync.video",1,"video-1",[["subtitle-1","video-1","529","base",true,"https://cdn.example/sub.vtt",3,null,1,"https://cdn.example/sub.vtt"]]]'
const GOLDEN_VIDEO_CHECKSUM =
  'sha256:ad92e982e4304e0baf251a0de18d6f3dea2b5f9937fc3caf5c171655b0a855ea'
const GOLDEN_ROOT_CANONICAL =
  '["jfp.subtitle-sync.root",1,1,[["video-1",1,"sha256:ad92e982e4304e0baf251a0de18d6f3dea2b5f9937fc3caf5c171655b0a855ea"]]]'
const GOLDEN_ROOT_CHECKSUM =
  'sha256:d973312fe3ef8c37c5dc0969a599d9191cd930893661a21a856d1c8b6e83e723'

function source(
  overrides: Partial<VideoSubtitleChecksumSourceRecord> = {}
): VideoSubtitleChecksumSourceRecord {
  return { ...GOLDEN_SOURCE, ...overrides }
}

describe('videoSubtitleChecksum', () => {
  describe('canonical version 1', () => {
    it('pins literal canonical bytes and golden SHA-256 digests', () => {
      const manifest = buildVideoSubtitleChecksumManifest([GOLDEN_SOURCE])

      expect(VIDEO_SUBTITLE_CHECKSUM_VERSION).toBe(1)
      expect(
        serializeVideoSubtitleChecksumBucket('video-1', [GOLDEN_SOURCE])
      ).toBe(GOLDEN_VIDEO_CANONICAL)
      expect(manifest.buckets).toEqual([
        {
          videoId: 'video-1',
          count: 1,
          checksum: GOLDEN_VIDEO_CHECKSUM
        }
      ])
      expect(serializeVideoSubtitleChecksumRoot(1, manifest.buckets)).toBe(
        GOLDEN_ROOT_CANONICAL
      )
      expect(manifest.rootChecksum).toBe(GOLDEN_ROOT_CHECKSUM)
      expect(manifest.snapshot).toBe(`subtitle-sync:v1:${GOLDEN_ROOT_CHECKSUM}`)
    })

    it('serializes quotes, slashes, CRLF, emoji, and distinct Unicode forms exactly', () => {
      const special = source({
        id: 'id"\\/\r\n😀',
        videoId: 'vid/😀',
        languageId: 'é/é',
        edition: 'base\\/"\r\n',
        primary: false,
        vttSrc: 'https://cdn.test/a/"q"\\file\r\n😀é/é',
        vttVersion: 9,
        srtSrc: '',
        srtVersion: 0
      })

      expect(
        serializeVideoSubtitleChecksumBucket(special.videoId, [special])
      ).toBe(
        '["jfp.subtitle-sync.video",1,"vid/😀",[["id\\"\\\\/\\r\\n😀","vid/😀","é/é","base\\\\/\\"\\r\\n",false,"https://cdn.test/a/\\"q\\"\\\\file\\r\\n😀é/é",9,"",0,"https://cdn.test/a/\\"q\\"\\\\file\\r\\n😀é/é"]]]'
      )
      expect(special.languageId).not.toBe('é/é')
    })

    it('preserves null and distinguishes it from an empty string', () => {
      const withNull = buildVideoSubtitleChecksumManifest([
        source({ vttSrc: null, srtSrc: null })
      ])
      const withEmpty = buildVideoSubtitleChecksumManifest([
        source({ vttSrc: '', srtSrc: null })
      ])

      expect(withNull.details).toEqual([])
      expect(withNull.buckets[0].checksum).not.toBe(
        withEmpty.buckets[0].checksum
      )
      expect(
        serializeVideoSubtitleChecksumBucket('video-1', [
          source({ vttSrc: null, srtSrc: null })
        ])
      ).toContain(',null,3,null,1,""]')
      expect(
        serializeVideoSubtitleChecksumBucket('video-1', [
          source({ vttSrc: '', srtSrc: null })
        ])
      ).toContain(',"",3,null,1,""]')
    })

    it.each([
      ['id', { id: 'subtitle-2' }],
      ['videoId', { videoId: 'video-2' }],
      ['languageId', { languageId: '531' }],
      ['edition', { edition: 'dub' }],
      ['primary', { primary: false }],
      ['vttSrc', { vttSrc: 'https://cdn.example/other.vtt' }],
      ['vttVersion', { vttVersion: 4 }],
      ['srtSrc', { srtSrc: 'https://cdn.example/sub.srt' }],
      ['srtVersion', { srtVersion: 2 }]
    ] satisfies ReadonlyArray<
      readonly [string, Partial<VideoSubtitleChecksumSourceRecord>]
    >)('changes the root when canonical field %s changes', (_field, change) => {
      const baseline = buildVideoSubtitleChecksumManifest([GOLDEN_SOURCE])
      const changed = buildVideoSubtitleChecksumManifest([source(change)])

      expect(changed.rootChecksum).not.toBe(baseline.rootChecksum)
    })

    it('ignores non-canonical timestamps at the source boundary', () => {
      const extendedSource = {
        ...GOLDEN_SOURCE,
        createdAt: new Date('2020-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z')
      }

      expect(buildVideoSubtitleChecksumManifest([extendedSource])).toEqual(
        buildVideoSubtitleChecksumManifest([GOLDEN_SOURCE])
      )
    })
  })

  describe('hierarchical manifest', () => {
    const rows = [
      source({ id: 'é', videoId: 'z-video' }),
      source({ id: 'é', videoId: 'z-video', languageId: '531' }),
      source({ id: 'alpha', videoId: 'a-video', edition: 'dub' })
    ]

    it('builds the literal empty manifest vector', () => {
      expect(buildVideoSubtitleChecksumManifest([])).toEqual({
        version: 1,
        snapshot:
          'subtitle-sync:v1:sha256:c1fda15944a413c8c6195270716250d6db2a00a30941338c0ff6bbe65e4b956d',
        totalCount: 0,
        rootChecksum:
          'sha256:c1fda15944a413c8c6195270716250d6db2a00a30941338c0ff6bbe65e4b956d',
        buckets: [],
        details: []
      })
      expect(serializeVideoSubtitleChecksumRoot(0, [])).toBe(
        '["jfp.subtitle-sync.root",1,0,[]]'
      )
    })

    it('is invariant to source row order and byte-sorts rows and buckets', () => {
      const forward = buildVideoSubtitleChecksumManifest(rows, [
        'z-video',
        'a-video'
      ])
      const shuffled = buildVideoSubtitleChecksumManifest(
        [rows[2], rows[0], rows[1]],
        ['a-video', 'z-video']
      )

      expect(shuffled).toEqual(forward)
      expect(forward.buckets.map(({ videoId }) => videoId)).toEqual([
        'a-video',
        'z-video'
      ])
      expect(forward.details[1].subtitles.map(({ id }) => id)).toEqual([
        'é',
        'é'
      ])
      expect(forward.totalCount).toBe(3)
      expect(
        forward.buckets.reduce((sum, bucket) => sum + bucket.count, 0)
      ).toBe(forward.totalCount)
    })

    it('changes the hierarchy when a row moves or is removed', () => {
      const baseline = buildVideoSubtitleChecksumManifest(rows)
      const moved = buildVideoSubtitleChecksumManifest([
        { ...rows[0], videoId: 'a-video' },
        rows[1],
        rows[2]
      ])
      const removed = buildVideoSubtitleChecksumManifest(rows.slice(1))

      expect(moved.rootChecksum).not.toBe(baseline.rootChecksum)
      expect(moved.buckets.map(({ count }) => count)).toEqual([2, 1])
      expect(removed.rootChecksum).not.toBe(baseline.rootChecksum)
      expect(removed.totalCount).toBe(2)
    })

    it('returns deterministic de-duplicated details and a literal empty bucket', () => {
      const manifest = buildVideoSubtitleChecksumManifest(rows, [
        'z-video',
        'video-empty',
        'a-video',
        'video-empty'
      ])
      const emptyDetail = manifest.details.find(
        ({ videoId }) => videoId === 'video-empty'
      )

      expect(manifest.details.map(({ videoId }) => videoId)).toEqual([
        'a-video',
        'video-empty',
        'z-video'
      ])
      expect(emptyDetail).toEqual({
        videoId: 'video-empty',
        count: 0,
        checksum:
          'sha256:fdebc88a680346820a2680f64e8b41294562986368e170cc8752c222f3dd88d6',
        subtitles: []
      })
      expect(serializeVideoSubtitleChecksumBucket('video-empty', [])).toBe(
        '["jfp.subtitle-sync.video",1,"video-empty",[]]'
      )
    })

    it('keeps requested detail records identical to the canonical sync projection', () => {
      const manifest = buildVideoSubtitleChecksumManifest(
        [GOLDEN_SOURCE],
        ['video-1']
      )

      expect(manifest.details[0].subtitles).toEqual([
        {
          ...GOLDEN_SOURCE,
          value: GOLDEN_SOURCE.vttSrc
        }
      ])
    })

    it('keeps a representative 12k-row and 1.2k-bucket manifest under 512 KiB', () => {
      const representativeRows = Array.from({ length: 12_000 }, (_, index) =>
        source({
          id: `subtitle-${index.toString().padStart(5, '0')}`,
          videoId: `video-${Math.floor(index / 10)
            .toString()
            .padStart(4, '0')}`,
          languageId: String(500 + (index % 10))
        })
      )

      const manifest = buildVideoSubtitleChecksumManifest(representativeRows)
      const graphqlPayloadBytes = Buffer.byteLength(
        JSON.stringify({ data: { videoSubtitleChecksumManifest: manifest } }),
        'utf8'
      )

      expect(manifest.totalCount).toBe(12_000)
      expect(manifest.buckets).toHaveLength(1_200)
      expect(graphqlPayloadBytes).toBeLessThanOrEqual(512 * 1024)
    })
  })
})
