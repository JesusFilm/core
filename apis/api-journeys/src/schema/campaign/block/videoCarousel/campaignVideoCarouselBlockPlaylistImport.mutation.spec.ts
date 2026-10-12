import { campaignBlockWithAcl } from '../../../../../test/campaignBlockFactory'
import {
  authClient,
  setupCampaignBlockSpec
} from '../../../../../test/campaignBlockSpec'
import { CampaignFixture } from '../../../../../test/campaignFactory'
import { prismaMock } from '../../../../../test/prismaMock'
import { graphql } from '../../../../lib/graphql/subgraphGraphql'

import { parsePlaylistUrl } from './youTubePlaylist'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

const PLAYLIST_ID = 'PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG'
const PLAYLIST_URL = `https://www.youtube.com/playlist?list=${PLAYLIST_ID}`

function youTubeId(index: number): string {
  return `video${String(index).padStart(6, '0')}`
}

function jsonResponse(body: unknown): Response {
  return { json: async () => body } as unknown as Response
}

describe('parsePlaylistUrl', () => {
  it.each([
    [PLAYLIST_URL, PLAYLIST_ID],
    [`https://youtube.com/playlist?list=${PLAYLIST_ID}`, PLAYLIST_ID],
    [`https://m.youtube.com/playlist/?list=${PLAYLIST_ID}`, PLAYLIST_ID],
    [`https://www.youtube.com/watch?v=jQaN9DvFTbw&list=${PLAYLIST_ID}`, null],
    ['https://www.youtube.com/playlist', null],
    [`https://example.com/playlist?list=${PLAYLIST_ID}`, null],
    ['not a url', null]
  ])('reads %s as %s', (url, expected) => {
    expect(parsePlaylistUrl(url)).toBe(expected)
  })
})

describe('campaignVideoCarouselBlockPlaylistImport', () => {
  const IMPORT = graphql(`
    mutation CampaignVideoCarouselBlockPlaylistImport($id: ID!, $url: String!) {
      campaignVideoCarouselBlockPlaylistImport(id: $id, url: $url) {
        id
        parentBlockId
        parentOrder
        source
        videoId
        title
        description
        image
        duration
      }
    }
  `)

  let fixture: CampaignFixture
  let fetchSpy: ReturnType<typeof vi.spyOn>

  /** The playlist's items, then the videos request answering for whichever ids it names. */
  function mockYouTube(count: number, missing: string[] = []): void {
    fetchSpy.mockImplementation(async (input: string) => {
      const url = new URL(input)
      if (url.pathname.endsWith('/playlistItems'))
        return jsonResponse({
          items: Array.from({ length: count }, (_, index) => ({
            contentDetails: { videoId: youTubeId(index) }
          }))
        })
      const ids = (url.searchParams.get('id') ?? '').split(',')
      return jsonResponse({
        items: ids
          .filter((id) => !missing.includes(id))
          .reverse()
          .map((id) => ({
            id,
            snippet: {
              title: `Title ${id}`,
              description: `Description ${id}`,
              thumbnails: {
                high: { url: `https://i.ytimg.com/vi/${id}/hq.jpg` }
              }
            },
            contentDetails: { duration: 'PT2M5S' }
          }))
      })
    })
  }

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    fetchSpy = vi.spyOn(globalThis, 'fetch')
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'carouselId')
    )
    prismaMock.campaignBlock.findMany.mockResolvedValue([
      {
        ...fixture.blocks.find((block) => block.id === 'carouselId')!,
        id: 'existingItemId',
        typename: 'CampaignVideoBlock',
        parentBlockId: 'carouselId',
        parentOrder: 0
      }
    ])
    prismaMock.campaignBlock.createManyAndReturn.mockImplementation((async ({
      data
    }: any) => [...data].reverse()) as never)
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  async function importPlaylist(url = PLAYLIST_URL): Promise<any> {
    return await authClient({
      document: IMPORT,
      variables: { id: 'carouselId', url }
    })
  }

  it('creates the first 12 videos as explicit CampaignVideoBlock children in one bulk create, each with its fetched fields', async () => {
    mockYouTube(15)

    const result = await importPlaylist()

    expect(result.errors).toBeUndefined()
    expect(prismaMock.campaignBlock.createManyAndReturn).toHaveBeenCalledTimes(
      1
    )
    expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
    const [{ data }] = vi.mocked(prismaMock.campaignBlock.createManyAndReturn)
      .mock.calls[0] as any
    expect(data).toHaveLength(12)
    expect(data[0]).toMatchObject({
      typename: 'CampaignVideoBlock',
      campaignId: fixture.id,
      pageId: 'landingPageId',
      regionId: null,
      parentBlockId: 'carouselId',
      parentOrder: 1,
      source: 'youTube',
      videoId: youTubeId(0),
      videoVariantLanguageId: null,
      title: `Title ${youTubeId(0)}`,
      description: `Description ${youTubeId(0)}`,
      image: `https://i.ytimg.com/vi/${youTubeId(0)}/hq.jpg`,
      duration: 125
    })
    expect(data[11]).toMatchObject({
      parentOrder: 12,
      videoId: youTubeId(11)
    })

    const items = result.data.campaignVideoCarouselBlockPlaylistImport
    expect(items.map((item: any) => item.videoId)).toEqual(
      Array.from({ length: 12 }, (_, index) => youTubeId(index))
    )
    expect(items[0]).toMatchObject({
      parentBlockId: 'carouselId',
      parentOrder: 1,
      source: 'youTube',
      duration: 125
    })
    expect(prismaMock.campaign.update).toHaveBeenCalled()
  })

  it('asks the Data API for 12 playlist items, then their videos in one request', async () => {
    mockYouTube(3)

    await importPlaylist()

    expect(fetchSpy).toHaveBeenCalledTimes(2)
    const playlistUrl = new URL(String(fetchSpy.mock.calls[0][0]))
    expect(playlistUrl.searchParams.get('playlistId')).toBe(PLAYLIST_ID)
    expect(playlistUrl.searchParams.get('maxResults')).toBe('12')
    const videosUrl = new URL(String(fetchSpy.mock.calls[1][0]))
    expect(videosUrl.searchParams.get('id')).toBe(
      [0, 1, 2].map(youTubeId).join(',')
    )
  })

  it('skips playlist entries YouTube no longer serves, keeping playlist order', async () => {
    mockYouTube(3, [youTubeId(1)])

    const result = await importPlaylist()

    expect(
      result.data.campaignVideoCarouselBlockPlaylistImport.map(
        (item: any) => item.videoId
      )
    ).toEqual([youTubeId(0), youTubeId(2)])
  })

  it('refuses a link that is not a playlist (BAD_USER_INPUT, url) without calling YouTube', async () => {
    const result = await importPlaylist(
      'https://www.youtube.com/watch?v=jQaN9DvFTbw'
    )

    expect(result.errors[0]).toMatchObject({
      message: "That link isn't a YouTube playlist",
      extensions: { code: 'BAD_USER_INPUT', field: 'url' }
    })
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(prismaMock.campaignBlock.createManyAndReturn).not.toHaveBeenCalled()
  })

  it('refuses an empty playlist (BAD_USER_INPUT, url)', async () => {
    mockYouTube(0)

    const result = await importPlaylist()

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'url'
    })
    expect(prismaMock.campaignBlock.createManyAndReturn).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND for a playlist YouTube does not know', async () => {
    fetchSpy.mockResolvedValue(
      jsonResponse({ error: { code: 404, message: 'playlistNotFound' } })
    )

    const result = await importPlaylist()

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
  })

  it('throws NOT_FOUND when the id is not a live CampaignVideoCarouselBlock', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'heroId')
    )

    const result = await importPlaylist()

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
