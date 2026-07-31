import { createHash } from 'node:crypto'

export const VIDEO_SUBTITLE_CHECKSUM_VERSION = 1 as const

const VIDEO_SUBTITLE_BUCKET_DOMAIN = 'jfp.subtitle-sync.video'
const VIDEO_SUBTITLE_ROOT_DOMAIN = 'jfp.subtitle-sync.root'

export interface VideoSubtitleChecksumSourceRecord {
  id: string
  videoId: string
  languageId: string
  edition: string
  primary: boolean
  vttSrc: string | null
  vttVersion: number
  srtSrc: string | null
  srtVersion: number
}

export interface VideoSubtitleChecksumRecord
  extends VideoSubtitleChecksumSourceRecord {
  value: string
}

export interface VideoSubtitleChecksumBucket {
  videoId: string
  count: number
  checksum: string
}

export interface VideoSubtitleChecksumDetail
  extends VideoSubtitleChecksumBucket {
  subtitles: VideoSubtitleChecksumRecord[]
}

export interface VideoSubtitleChecksumManifest {
  version: typeof VIDEO_SUBTITLE_CHECKSUM_VERSION
  snapshot: string
  totalCount: number
  rootChecksum: string
  buckets: VideoSubtitleChecksumBucket[]
  details: VideoSubtitleChecksumDetail[]
}

type VideoSubtitleChecksumTuple = readonly [
  id: string,
  videoId: string,
  languageId: string,
  edition: string,
  primary: boolean,
  vttSrc: string | null,
  vttVersion: number,
  srtSrc: string | null,
  srtVersion: number,
  value: string
]

type VideoSubtitleChecksumBucketTuple = readonly [
  videoId: string,
  count: number,
  checksum: string
]

function compareUtf8(left: string, right: string): number {
  return Buffer.compare(Buffer.from(left, 'utf8'), Buffer.from(right, 'utf8'))
}

function createChecksum(canonicalValue: string): string {
  return `sha256:${createHash('sha256')
    .update(canonicalValue, 'utf8')
    .digest('hex')}`
}

function toChecksumRecord(
  source: VideoSubtitleChecksumSourceRecord
): VideoSubtitleChecksumRecord {
  return {
    id: source.id,
    videoId: source.videoId,
    languageId: source.languageId,
    edition: source.edition,
    primary: source.primary,
    vttSrc: source.vttSrc,
    vttVersion: source.vttVersion,
    srtSrc: source.srtSrc,
    srtVersion: source.srtVersion,
    value: source.vttSrc ?? source.srtSrc ?? ''
  }
}

function toChecksumTuple(
  record: VideoSubtitleChecksumRecord
): VideoSubtitleChecksumTuple {
  return [
    record.id,
    record.videoId,
    record.languageId,
    record.edition,
    record.primary,
    record.vttSrc,
    record.vttVersion,
    record.srtSrc,
    record.srtVersion,
    record.value
  ]
}

function sortChecksumRecords(
  sources: readonly VideoSubtitleChecksumSourceRecord[]
): VideoSubtitleChecksumRecord[] {
  return sources
    .map(toChecksumRecord)
    .sort((left, right) => compareUtf8(left.id, right.id))
}

function serializeChecksumRecords(
  videoId: string,
  records: readonly VideoSubtitleChecksumRecord[]
): string {
  return JSON.stringify([
    VIDEO_SUBTITLE_BUCKET_DOMAIN,
    VIDEO_SUBTITLE_CHECKSUM_VERSION,
    videoId,
    records.map(toChecksumTuple)
  ])
}

export function serializeVideoSubtitleChecksumBucket(
  videoId: string,
  sources: readonly VideoSubtitleChecksumSourceRecord[]
): string {
  return serializeChecksumRecords(videoId, sortChecksumRecords(sources))
}

export function serializeVideoSubtitleChecksumRoot(
  totalCount: number,
  buckets: readonly VideoSubtitleChecksumBucket[]
): string {
  const bucketTuples: VideoSubtitleChecksumBucketTuple[] = [...buckets]
    .sort((left, right) => compareUtf8(left.videoId, right.videoId))
    .map(({ videoId, count, checksum }) => [videoId, count, checksum])

  return JSON.stringify([
    VIDEO_SUBTITLE_ROOT_DOMAIN,
    VIDEO_SUBTITLE_CHECKSUM_VERSION,
    totalCount,
    bucketTuples
  ])
}

export function buildVideoSubtitleChecksumManifest(
  sources: readonly VideoSubtitleChecksumSourceRecord[],
  detailsForVideoIds: readonly string[] = []
): VideoSubtitleChecksumManifest {
  const requestedVideoIds = [...new Set(detailsForVideoIds)].sort(compareUtf8)
  const requestedVideoIdSet = new Set(requestedVideoIds)
  const sourcesByVideoId = new Map<
    string,
    VideoSubtitleChecksumSourceRecord[]
  >()

  for (const source of sources) {
    const videoSources = sourcesByVideoId.get(source.videoId)
    if (videoSources == null) {
      sourcesByVideoId.set(source.videoId, [source])
    } else {
      videoSources.push(source)
    }
  }

  const recordsByVideoId = new Map<string, VideoSubtitleChecksumRecord[]>()
  const buckets = [...sourcesByVideoId.entries()]
    .sort(([leftVideoId], [rightVideoId]) =>
      compareUtf8(leftVideoId, rightVideoId)
    )
    .map(([videoId, videoSources]): VideoSubtitleChecksumBucket => {
      const records = sortChecksumRecords(videoSources)
      if (requestedVideoIdSet.has(videoId))
        recordsByVideoId.set(videoId, records)
      return {
        videoId,
        count: records.length,
        checksum: createChecksum(serializeChecksumRecords(videoId, records))
      }
    })

  const totalCount = sources.length
  const rootChecksum = createChecksum(
    serializeVideoSubtitleChecksumRoot(totalCount, buckets)
  )
  const bucketsByVideoId = new Map(
    buckets.map((bucket) => [bucket.videoId, bucket])
  )
  const details = requestedVideoIds.map(
    (videoId): VideoSubtitleChecksumDetail => {
      const records = recordsByVideoId.get(videoId) ?? []
      const bucket = bucketsByVideoId.get(videoId)
      return {
        videoId,
        count: records.length,
        checksum:
          bucket?.checksum ??
          createChecksum(serializeChecksumRecords(videoId, records)),
        subtitles: records
      }
    }
  )

  return {
    version: VIDEO_SUBTITLE_CHECKSUM_VERSION,
    snapshot: `subtitle-sync:v1:${rootChecksum}`,
    totalCount,
    rootChecksum,
    buckets,
    details
  }
}
