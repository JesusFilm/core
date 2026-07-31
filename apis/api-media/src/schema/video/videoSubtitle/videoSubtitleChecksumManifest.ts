import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/media/client'

import { builder } from '../../builder'

import {
  type VideoSubtitleChecksumBucket,
  type VideoSubtitleChecksumDetail,
  type VideoSubtitleChecksumManifest,
  type VideoSubtitleChecksumRecord,
  buildVideoSubtitleChecksumManifest
} from './videoSubtitleChecksum'

const MAX_DETAIL_VIDEO_IDS = 100

const VideoSubtitleChecksumRecordRef =
  builder.objectRef<VideoSubtitleChecksumRecord>('VideoSubtitleChecksumRecord')

VideoSubtitleChecksumRecordRef.implement({
  description:
    'A version 1 subtitle synchronization record. It covers repair metadata only and does not verify subtitle object bytes.',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    videoId: t.exposeID('videoId', { nullable: false }),
    languageId: t.exposeID('languageId', { nullable: false }),
    edition: t.exposeString('edition', { nullable: false }),
    primary: t.exposeBoolean('primary', { nullable: false }),
    vttSrc: t.exposeString('vttSrc'),
    vttVersion: t.exposeInt('vttVersion', { nullable: false }),
    srtSrc: t.exposeString('srtSrc'),
    srtVersion: t.exposeInt('srtVersion', { nullable: false }),
    value: t.exposeString('value', { nullable: false })
  })
})

const VideoSubtitleChecksumBucketRef =
  builder.objectRef<VideoSubtitleChecksumBucket>('VideoSubtitleChecksumBucket')

VideoSubtitleChecksumBucketRef.implement({
  description:
    'The count and version 1 checksum for one source video in the authoritative synchronization projection.',
  fields: (t) => ({
    videoId: t.exposeID('videoId', { nullable: false }),
    count: t.exposeInt('count', { nullable: false }),
    checksum: t.exposeString('checksum', { nullable: false })
  })
})

const VideoSubtitleChecksumDetailRef =
  builder.objectRef<VideoSubtitleChecksumDetail>('VideoSubtitleChecksumDetail')

VideoSubtitleChecksumDetailRef.implement({
  description:
    'Repair metadata for one requested source video, computed from the same database rowset as the manifest.',
  fields: (t) => ({
    videoId: t.exposeID('videoId', { nullable: false }),
    count: t.exposeInt('count', { nullable: false }),
    checksum: t.exposeString('checksum', { nullable: false }),
    subtitles: t.field({
      type: [VideoSubtitleChecksumRecordRef],
      nullable: false,
      resolve: ({ subtitles }) => subtitles
    })
  })
})

const VideoSubtitleChecksumManifestRef =
  builder.objectRef<VideoSubtitleChecksumManifest>(
    'VideoSubtitleChecksumManifest'
  )

VideoSubtitleChecksumManifestRef.implement({
  description:
    'A source-authoritative version 1 checksum manifest for subtitle synchronization repair metadata. The snapshot, buckets, and requested details share one database statement snapshot; object bytes are outside this contract.',
  fields: (t) => ({
    version: t.exposeInt('version', { nullable: false }),
    snapshot: t.exposeString('snapshot', { nullable: false }),
    totalCount: t.exposeInt('totalCount', { nullable: false }),
    rootChecksum: t.exposeString('rootChecksum', { nullable: false }),
    buckets: t.field({
      type: [VideoSubtitleChecksumBucketRef],
      nullable: false,
      resolve: ({ buckets }) => buckets
    }),
    details: t.field({
      type: [VideoSubtitleChecksumDetailRef],
      nullable: false,
      resolve: ({ details }) => details
    })
  })
})

builder.queryFields((t) => ({
  videoSubtitleChecksumManifest: t.withAuth({ isValidInterop: true }).field({
    type: VideoSubtitleChecksumManifestRef,
    nullable: false,
    description:
      'Returns a version 1 subtitle repair manifest and optional details from one authoritative rowset. Pass expectedSnapshot to reject details when Core changed after discovery.',
    args: {
      detailsForVideoIds: t.arg.idList({ required: false }),
      expectedSnapshot: t.arg.string({ required: false })
    },
    resolve: async (
      _parent,
      { detailsForVideoIds: detailsForVideoIdsInput, expectedSnapshot }
    ) => {
      const detailsForVideoIds = [
        ...new Set((detailsForVideoIdsInput ?? []).map(String))
      ]

      if (detailsForVideoIds.length > MAX_DETAIL_VIDEO_IDS) {
        throw new GraphQLError(
          `detailsForVideoIds cannot contain more than ${MAX_DETAIL_VIDEO_IDS} unique IDs`,
          { extensions: { code: 'BAD_USER_INPUT' } }
        )
      }

      const subtitles = await prisma.videoSubtitle.findMany({
        select: {
          id: true,
          videoId: true,
          languageId: true,
          edition: true,
          primary: true,
          vttSrc: true,
          vttVersion: true,
          srtSrc: true,
          srtVersion: true
        }
      })
      const manifest = buildVideoSubtitleChecksumManifest(
        subtitles,
        detailsForVideoIds
      )

      if (expectedSnapshot != null && expectedSnapshot !== manifest.snapshot) {
        throw new GraphQLError(
          'Subtitle checksum snapshot no longer matches Core',
          { extensions: { code: 'SUBTITLE_SNAPSHOT_MISMATCH' } }
        )
      }

      return manifest
    }
  })
}))
