import { vi } from 'vitest'

import { campaignBlockWithAcl } from '../../../../../test/campaignBlockFactory'
import {
  authClient,
  setupCampaignBlockSpec
} from '../../../../../test/campaignBlockSpec'
import {
  CampaignBlockRow,
  CampaignFixture
} from '../../../../../test/campaignFactory'
import { prismaMock } from '../../../../../test/prismaMock'
import { graphql } from '../../../../lib/graphql/subgraphGraphql'
import { fetchFieldsFromYouTube } from '../../../block/video/service'

import {
  PLAYLIST_IMPORT_LIMIT,
  parseYouTubePlaylistUrl
} from './campaignVideoCarouselBlockPlaylistImport.mutation'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

vi.mock('../../../block/video/service', async () => ({
  ...(await vi.importActual('../../../block/video/service')),
  fetchFieldsFromYouTube: vi.fn()
}))

function playlistItem(i: number) {
  return {
    videoId: `vid${i}`,
    title: `Video ${i}`,
    image: `https://i.ytimg.com/vi/vid${i}/hqdefault.jpg`
  }
}

describe('parseYouTubePlaylistUrl', () => {
  it('reads the list parameter of a playlist link', () => {
    expect(
      parseYouTubePlaylistUrl(
        'https://www.youtube.com/playlist?list=PL123abc'
      )
    ).toBe('PL123abc')
    expect(
      parseYouTubePlaylistUrl('https://youtu.be/playlist?list=PL123abc')
    ).toBe('PL123abc')
  })

  it('reads the list parameter of an embed link', () => {
    expect(
      parseYouTubePlaylistUrl(
        'https://www.youtube.com/embed/vid0?list=PL123abc'
      )
    ).toBe('PL123abc')
  })

  it('returns null for a bare video link and non-YouTube hosts', () => {
    expect(
      parseYouTubePlaylistUrl('https://www.youtube.com/watch?v=vid0')
    ).toBeNull()
    expect(
      parseYouTubePlaylistUrl(
        'https://www.jesusfilm.org/watch/jesus.html/english.html'
      )
    ).toBeNull()
    expect(parseYouTubePlaylistUrl('not a url')).toBeNull()
  })
})

describe('campaignVideoCarouselBlockPlaylistImport', () => {
  const IMPORT = graphql(`
    mutation CampaignVideoCarouselBlockPlaylistImport($id: ID!, $url: String!) {
      campaignVideoCarouselBlockPlaylistImport(id: $id, url: $url) {
        id
        source
        videoId
        parentBlockId
        parentOrder
        title
        description
        image
        duration
      }
    }
  `)

  let fixture: CampaignFixture

  function carouselAcl(): any {
    const block = fixture.blocks.find((candidate) => candidate.id === 'carouselId')!
    const { team, languages, theme, pages, blocks, regions, strings, ...row } =
      fixture
    return {
      ...block,
      action: null,
      campaign: { ...row, team },
      pageId: 'landingPageId',
      regionId: null
    }
  }

  function videoRow(id: string, parentOrder: number): CampaignBlockRow {
    const carousel = fixture.blocks.find((candidate) => candidate.id === 'carouselId')!
    return {
      ...carousel,
      id,
      typename: 'CampaignVideoBlock',
      parentBlockId: 'carouselId',
      parentOrder,
      source: 'youTube',
      videoId: id,
      title: `Title ${id}`,
      description: `Description ${id}`,
      image: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      duration: 60,
      action: null
    }
  }

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    prismaMock.campaignBlock.findFirst.mockResolvedValue(carouselAcl())
    prismaMock.campaignBlock.update.mockResolvedValue(carouselAcl())
    // 15 of the playlist's videos answer, so the import takes its first 12.
    const ids = Array.from(
      { length: PLAYLIST_IMPORT_LIMIT + 3 },
      (_, i) => `vid${i}`
    )
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: async () => ({
        items: ids.map((id) => ({
          snippet: {
            title: `Title ${id}`,
            thumbnails: { high: { url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` } }
          },
          contentDetails: { videoId: id }
        }))
      })
    }))
    vi.mocked(fetchFieldsFromYouTube).mockImplementation(
      (async (id: string) => ({
        title: `Title ${id}`,
        description: `Description ${id}`,
        image: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        duration: 60
      })) as never
    )
    prismaMock.campaignBlock.createMany.mockResolvedValue({ count: PLAYLIST_IMPORT_LIMIT })
    prismaMock.campaignBlock.findMany.mockResolvedValue(
      Array.from({ length: PLAYLIST_IMPORT_LIMIT }, (_, i) =>
        videoRow(`vid${i}`, i)
      )
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('imports the playlist first 12 videos as ordered YouTube children in one bulk create and clears the Watch expansion', async () => {
    const result = (await authClient({
      document: IMPORT,
      variables: {
        id: 'carouselId',
        url: 'https://www.youtube.com/playlist?list=PL123abc'
      }
    })) as any

    expect(result.errors).toBeUndefined()
    const created = result.data.campaignVideoCarouselBlockPlaylistImport
    expect(created).toHaveLength(PLAYLIST_IMPORT_LIMIT)
    expect(created.map((block: any) => block.parentOrder)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
    ])
    expect(created.every((block: any) => block.source === 'youTube')).toBe(true)
    expect(created[0]).toMatchObject({
      id: 'vid0',
      videoId: 'vid0',
      title: 'Title vid0',
      description: 'Description vid0',
      duration: 60,
      parentBlockId: 'carouselId'
    })

    expect(prismaMock.campaignBlock.createMany).toHaveBeenCalledTimes(1)
    const rows = (
      prismaMock.campaignBlock.createMany.mock.calls[0][0] as {
        data: Record<string, unknown>[]
      }
    ).data
    expect(rows).toHaveLength(PLAYLIST_IMPORT_LIMIT)
    expect(rows[0]).toMatchObject({
      typename: 'CampaignVideoBlock',
      campaignId: 'campaignId',
      pageId: 'landingPageId',
      regionId: null,
      parentBlockId: 'carouselId',
      parentOrder: 0,
      source: 'youTube',
      videoId: 'vid0',
      title: 'Title vid0',
      description: 'Description vid0',
      duration: 60
    })
    // Only the first 12 of the playlist are imported.
    expect(rows.map((row) => row.parentOrder)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
    ])

    // The Watch expansion is cleared so the items are what the carousel holds.
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { videoId: null, videoVariantLanguageId: null }
      })
    )
    expect(prismaMock.campaign.update).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      data: { updatedAt: expect.any(Date) }
    })
  })

  it('is NOT_FOUND (url) when the playlist has no videos', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: async () => ({ items: [] })
    }))

    const result = (await authClient({
      document: IMPORT,
      variables: {
        id: 'carouselId',
        url: 'https://www.youtube.com/playlist?list=PL123abc'
      }
    })) as any

    expect(result.errors[0].extensions).toMatchObject({
      code: 'NOT_FOUND',
      field: 'url'
    })
    expect(prismaMock.campaignBlock.createMany).not.toHaveBeenCalled()
  })

  it('is NOT_FOUND (url) when the address is not a playlist link', async () => {
    const result = (await authClient({
      document: IMPORT,
      variables: {
        id: 'carouselId',
        url: 'https://www.youtube.com/watch?v=vid0'
      }
    })) as any

    expect(result.errors[0].extensions).toMatchObject({
      code: 'NOT_FOUND',
      field: 'url'
    })
    expect(prismaMock.campaignBlock.createMany).not.toHaveBeenCalled()
  })

  it('is NOT_FOUND when the id is not a live carousel', async () => {
    // The hero resolves, but the query is scoped to the carousel typename, so
    // no live carousel is found.
    prismaMock.campaignBlock.findFirst.mockResolvedValue(null)

    const result = (await authClient({
      document: IMPORT,
      variables: {
        id: 'heroId',
        url: 'https://www.youtube.com/playlist?list=PL123abc'
      }
    })) as any

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
    expect(prismaMock.campaignBlock.createMany).not.toHaveBeenCalled()
  })
})
