import { parse } from 'graphql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { responseCacheTtlPerSchemaCoordinate } from '../../../yoga'
import { schema } from '../../schema'

import {
  buildVideoSubtitleChecksumManifest,
  type VideoSubtitleChecksumSourceRecord
} from './videoSubtitleChecksum'

const MANIFEST_QUERY = parse(`
  query VideoSubtitleChecksumManifest(
    $detailsForVideoIds: [ID!]
    $expectedSnapshot: String
  ) {
    videoSubtitleChecksumManifest(
      detailsForVideoIds: $detailsForVideoIds
      expectedSnapshot: $expectedSnapshot
    ) {
      version
      snapshot
      totalCount
      rootChecksum
      buckets {
        videoId
        count
        checksum
      }
      details {
        videoId
        count
        checksum
        subtitles {
          id
          videoId
          languageId
          edition
          primary
          vttSrc
          vttVersion
          srtSrc
          srtVersion
          value
        }
      }
    }
  }
`)

const DETAILS_QUERY = parse(`
  query VideoSubtitleChecksumDetails($detailsForVideoIds: [ID!]) {
    videoSubtitleChecksumManifest(detailsForVideoIds: $detailsForVideoIds) {
      details {
        videoId
        count
        checksum
        subtitles {
          id
        }
      }
    }
  }
`)

type TestVideoSubtitleRow = VideoSubtitleChecksumSourceRecord & {
  vttAssetId: string | null
  srtAssetId: string | null
  createdAt: Date
  updatedAt: Date
}

function sourceRow(
  overrides: Partial<VideoSubtitleChecksumSourceRecord> = {}
): TestVideoSubtitleRow {
  return {
    id: 'subtitle-b',
    videoId: 'video-z',
    languageId: '529',
    edition: 'base',
    primary: true,
    vttSrc: 'https://example.com/subtitle.vtt',
    vttVersion: 7,
    srtSrc: null,
    srtVersion: 3,
    vttAssetId: null,
    srtAssetId: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides
  }
}

describe('videoSubtitleChecksumManifest', () => {
  const publicClient = getClient({
    headers: {
      'x-forwarded-for': '127.0.0.1'
    }
  })
  const interopClient = getClient({
    headers: {
      'interop-token': 'test-interop-token',
      'x-forwarded-for': '127.0.0.1'
    }
  })
  const originalInteropToken = process.env.INTEROP_TOKEN
  const originalNatAddresses = process.env.NAT_ADDRESSES

  beforeEach(() => {
    process.env.INTEROP_TOKEN = 'test-interop-token'
    process.env.NAT_ADDRESSES = '127.0.0.1'
  })

  afterAll(() => {
    if (originalInteropToken == null) delete process.env.INTEROP_TOKEN
    else process.env.INTEROP_TOKEN = originalInteropToken
    if (originalNatAddresses == null) delete process.env.NAT_ADDRESSES
    else process.env.NAT_ADDRESSES = originalNatAddresses
  })

  it('bypasses response caching by schema coordinate', () => {
    expect(
      responseCacheTtlPerSchemaCoordinate['Query.videoSubtitleChecksumManifest']
    ).toBe(0)
  })

  it('exposes the exact version 1 manifest SDL and nullability', () => {
    const queryField = schema
      .getQueryType()
      ?.getFields().videoSubtitleChecksumManifest
    expect(queryField?.type.toString()).toBe('VideoSubtitleChecksumManifest!')
    expect(
      Object.fromEntries(
        queryField?.args.map(({ name, type }) => [name, type.toString()]) ?? []
      )
    ).toEqual({
      detailsForVideoIds: '[ID!]',
      expectedSnapshot: 'String'
    })

    const expectedFieldsByType = {
      VideoSubtitleChecksumManifest: {
        version: 'Int!',
        snapshot: 'String!',
        totalCount: 'Int!',
        rootChecksum: 'String!',
        buckets: '[VideoSubtitleChecksumBucket!]!',
        details: '[VideoSubtitleChecksumDetail!]!'
      },
      VideoSubtitleChecksumBucket: {
        videoId: 'ID!',
        count: 'Int!',
        checksum: 'String!'
      },
      VideoSubtitleChecksumDetail: {
        videoId: 'ID!',
        count: 'Int!',
        checksum: 'String!',
        subtitles: '[VideoSubtitleChecksumRecord!]!'
      },
      VideoSubtitleChecksumRecord: {
        id: 'ID!',
        videoId: 'ID!',
        languageId: 'ID!',
        edition: 'String!',
        primary: 'Boolean!',
        vttSrc: 'String',
        vttVersion: 'Int!',
        srtSrc: 'String',
        srtVersion: 'Int!',
        value: 'String!'
      }
    }

    for (const [typeName, expectedFields] of Object.entries(
      expectedFieldsByType
    )) {
      const type = schema.getType(typeName)
      expect(type).toHaveProperty('getFields')
      if (type == null || !('getFields' in type))
        throw new Error(`${typeName} is missing`)
      expect(
        Object.fromEntries(
          Object.entries(type.getFields()).map(([name, field]) => [
            name,
            field.type.toString()
          ])
        )
      ).toEqual(expectedFields)
    }
  })

  it('rejects a public request before reading Prisma', async () => {
    const result = await publicClient({ document: MANIFEST_QUERY })

    expect(result).toHaveProperty('data', null)
    expect(prismaMock.videoSubtitle.findMany).not.toHaveBeenCalled()
  })

  it('returns the authoritative manifest from exactly one scalar-only read', async () => {
    const row = sourceRow()
    prismaMock.videoSubtitle.findMany.mockResolvedValue([row])

    const result = await interopClient({ document: MANIFEST_QUERY })
    const expected = buildVideoSubtitleChecksumManifest([row])

    expect(prismaMock.videoSubtitle.findMany).toHaveBeenCalledTimes(1)
    expect(prismaMock.videoSubtitle.findMany).toHaveBeenCalledWith({
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
    expect(result).toHaveProperty('data.videoSubtitleChecksumManifest', {
      ...expected,
      details: []
    })
  })

  it('deduplicates requested IDs and returns missing details in UTF-8 order', async () => {
    const rows = [
      sourceRow(),
      sourceRow({ id: 'subtitle-a', videoId: 'video-a' })
    ]
    prismaMock.videoSubtitle.findMany.mockResolvedValue(rows)

    const result = await interopClient({
      document: DETAILS_QUERY,
      variables: {
        detailsForVideoIds: ['video-z', 'video-missing', 'video-a', 'video-z']
      }
    })
    const expected = buildVideoSubtitleChecksumManifest(rows, [
      'video-z',
      'video-missing',
      'video-a'
    ])

    expect(result).toHaveProperty(
      'data.videoSubtitleChecksumManifest.details',
      expected.details.map(({ videoId, count, checksum, subtitles }) => ({
        videoId,
        count,
        checksum,
        subtitles: subtitles.map(({ id }) => ({ id }))
      }))
    )
    expect(prismaMock.videoSubtitle.findMany).toHaveBeenCalledTimes(1)
  })

  it('accepts 100 unique detail IDs', async () => {
    const detailsForVideoIds = Array.from(
      { length: 100 },
      (_, index) => `video-${index}`
    )
    prismaMock.videoSubtitle.findMany.mockResolvedValue([])

    const result = await interopClient({
      document: DETAILS_QUERY,
      variables: { detailsForVideoIds }
    })

    expect(result).not.toHaveProperty('errors')
    expect(result).toHaveProperty(
      'data.videoSubtitleChecksumManifest.details.length',
      100
    )
    expect(prismaMock.videoSubtitle.findMany).toHaveBeenCalledTimes(1)
  })

  it('rejects more than 100 unique detail IDs before reading Prisma', async () => {
    const detailsForVideoIds = Array.from(
      { length: 101 },
      (_, index) => `video-${index}`
    )

    const result = await interopClient({
      document: DETAILS_QUERY,
      variables: { detailsForVideoIds }
    })

    expect(result).toHaveProperty('data', null)
    expect(result).toHaveProperty('errors[0].extensions.code', 'BAD_USER_INPUT')
    expect(prismaMock.videoSubtitle.findMany).not.toHaveBeenCalled()
  })

  it('returns details when expectedSnapshot matches the same rowset', async () => {
    const row = sourceRow()
    const { snapshot } = buildVideoSubtitleChecksumManifest([row])
    prismaMock.videoSubtitle.findMany.mockResolvedValue([row])

    const result = await interopClient({
      document: MANIFEST_QUERY,
      variables: {
        detailsForVideoIds: ['video-z'],
        expectedSnapshot: snapshot
      }
    })

    expect(result).not.toHaveProperty('errors')
    expect(result).toHaveProperty(
      'data.videoSubtitleChecksumManifest.snapshot',
      snapshot
    )
    expect(result).toHaveProperty(
      'data.videoSubtitleChecksumManifest.details[0].subtitles[0]',
      {
        id: 'subtitle-b',
        videoId: 'video-z',
        languageId: '529',
        edition: 'base',
        primary: true,
        vttSrc: 'https://example.com/subtitle.vtt',
        vttVersion: 7,
        srtSrc: null,
        srtVersion: 3,
        value: 'https://example.com/subtitle.vtt'
      }
    )
  })

  it('rejects a stale expectedSnapshot without partial authoritative data', async () => {
    prismaMock.videoSubtitle.findMany.mockResolvedValue([sourceRow()])

    const result = await interopClient({
      document: MANIFEST_QUERY,
      variables: {
        detailsForVideoIds: ['video-z'],
        expectedSnapshot: 'subtitle-sync:v1:sha256:stale'
      }
    })

    expect(result).toHaveProperty('data', null)
    expect(result).toHaveProperty(
      'errors[0].extensions.code',
      'SUBTITLE_SNAPSHOT_MISMATCH'
    )
    expect(prismaMock.videoSubtitle.findMany).toHaveBeenCalledTimes(1)
  })

  it('surfaces database failures instead of converting them to empty data', async () => {
    prismaMock.videoSubtitle.findMany.mockRejectedValue(
      new Error('subtitle database unavailable')
    )

    const result = await interopClient({ document: MANIFEST_QUERY })

    expect(result).toHaveProperty('data', null)
    expect(result).toHaveProperty(
      'errors[0].message',
      'subtitle database unavailable'
    )
    expect(prismaMock.videoSubtitle.findMany).toHaveBeenCalledTimes(1)
  })
})
