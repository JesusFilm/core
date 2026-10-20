import { GraphQLError } from 'graphql'

import { fetchWatchVideoBySlug } from '../../gatewayClient'

import {
  WATCH_URL_ERROR,
  resolveWatchUrl,
  watchSlugCandidates
} from './watchUrl'

vi.mock('../../gatewayClient', () => ({
  fetchWatchVideoBySlug: vi.fn()
}))

describe('watchSlugCandidates', () => {
  it.each([
    ['https://www.jesusfilm.org/watch/jesus.html', ['jesus/english']],
    [
      'https://www.jesusfilm.org/watch/jesus.html/english.html',
      ['jesus/english', 'english/english']
    ],
    [
      'https://www.jesusfilm.org/watch/lumo-acts-of-the-apostles.html/lumo-acts-1-1-8-3.html',
      [
        'lumo-acts-of-the-apostles/lumo-acts-1-1-8-3',
        'lumo-acts-1-1-8-3/english'
      ]
    ],
    [
      'https://www.jesusfilm.org/watch/hope.html/jesus/english.html',
      ['jesus/english']
    ],
    [
      ' https://www.jesusfilm.org/watch/jesus.html/english.html/ ',
      ['jesus/english', 'english/english']
    ],
    [
      'https://www.jesusfilm.org/watch/jesus.html/english.html?utm_source=share#t=10',
      ['jesus/english', 'english/english']
    ],
    [
      'https://www.jesusfilm.org/watch/jesus.html/spanish-latin-american.html',
      ['jesus/spanish-latin-american', 'spanish-latin-american/english']
    ],
    [
      'http://localhost:4300/watch/jesus.html/english.html',
      ['jesus/english', 'english/english']
    ]
  ])('reads %s to the candidate slugs %j', (url, slugs) => {
    expect(watchSlugCandidates(url)).toEqual(slugs)
  })

  it.each([
    'https://www.jesusfilm.org/watch',
    'https://www.jesusfilm.org/watch/a.html/b/c/d.html',
    'https://www.jesusfilm.org/about/jesus.html/english.html',
    'https://www.youtube.com/watch?v=jQaN9DvFTbw',
    'ftp://www.jesusfilm.org/watch/jesus.html/english.html',
    'jesus/english',
    ''
  ])('is empty for %s, not a Watch address', (url) => {
    expect(watchSlugCandidates(url)).toEqual([])
  })
})

describe('resolveWatchUrl', () => {
  beforeEach(() => {
    vi.mocked(fetchWatchVideoBySlug).mockReset()
  })

  it('resolves the variant slug to the Video id and its language through the gateway', async () => {
    vi.mocked(fetchWatchVideoBySlug).mockResolvedValue({
      id: '1_jf-0-0',
      label: 'featureFilm',
      childrenCount: 61,
      variant: { language: { id: '21028' } }
    })

    await expect(
      resolveWatchUrl(
        'https://www.jesusfilm.org/watch/jesus.html/spanish-latin-american.html'
      )
    ).resolves.toEqual({ videoId: '1_jf-0-0', languageId: '21028' })
    expect(fetchWatchVideoBySlug).toHaveBeenCalledTimes(1)
    expect(fetchWatchVideoBySlug).toHaveBeenCalledWith(
      'jesus/spanish-latin-american'
    )
  })

  it('falls back to the container/child reading of a two-part address', async () => {
    vi.mocked(fetchWatchVideoBySlug)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: '6_Acts0401',
        label: 'episode',
        childrenCount: 0,
        variant: { language: { id: '529' } }
      })

    await expect(
      resolveWatchUrl(
        'https://www.jesusfilm.org/watch/lumo-acts-of-the-apostles.html/lumo-acts-1-1-8-3.html'
      )
    ).resolves.toEqual({ videoId: '6_Acts0401', languageId: '529' })
    expect(fetchWatchVideoBySlug).toHaveBeenNthCalledWith(
      1,
      'lumo-acts-of-the-apostles/lumo-acts-1-1-8-3'
    )
    expect(fetchWatchVideoBySlug).toHaveBeenNthCalledWith(
      2,
      'lumo-acts-1-1-8-3/english'
    )
  })

  it('resolves a one-part address in the default language', async () => {
    vi.mocked(fetchWatchVideoBySlug).mockResolvedValue({
      id: '6_Acts',
      label: 'series',
      childrenCount: 4
    })

    await expect(
      resolveWatchUrl(
        'https://www.jesusfilm.org/watch/lumo-acts-of-the-apostles.html'
      )
    ).resolves.toEqual({ videoId: '6_Acts', languageId: null })
    expect(fetchWatchVideoBySlug).toHaveBeenCalledWith(
      'lumo-acts-of-the-apostles/english'
    )
  })

  it('is BAD_USER_INPUT on url when no candidate slug resolves', async () => {
    vi.mocked(fetchWatchVideoBySlug).mockResolvedValue(null)

    await expect(
      resolveWatchUrl('https://www.jesusfilm.org/watch/nope.html/english.html')
    ).rejects.toEqual(
      expect.objectContaining({
        message: WATCH_URL_ERROR,
        extensions: { code: 'BAD_USER_INPUT', field: 'url' }
      })
    )
    expect(fetchWatchVideoBySlug).toHaveBeenCalledTimes(2)
  })

  it('is BAD_USER_INPUT on url for a non-Watch shape without a gateway call', async () => {
    const error = await resolveWatchUrl('https://example.com/').catch(
      (caught: GraphQLError) => caught
    )

    expect(error).toMatchObject({
      message: "That link isn't a Watch video",
      extensions: { code: 'BAD_USER_INPUT', field: 'url' }
    })
    expect(fetchWatchVideoBySlug).not.toHaveBeenCalled()
  })
})
