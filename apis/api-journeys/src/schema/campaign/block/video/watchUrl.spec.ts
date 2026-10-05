import { GraphQLError } from 'graphql'

import { fetchWatchVideoBySlug } from '../../gatewayClient'

import { WATCH_URL_ERROR, parseWatchUrl, resolveWatchUrl } from './watchUrl'

vi.mock('../../gatewayClient', () => ({
  fetchWatchVideoBySlug: vi.fn()
}))

describe('parseWatchUrl', () => {
  it.each([
    [
      'https://www.jesusfilm.org/watch/jesus.html/english.html',
      'jesus/english'
    ],
    [
      'https://www.jesusfilm.org/watch/easter.html/jesus/english.html',
      'jesus/english'
    ],
    [
      ' https://www.jesusfilm.org/watch/jesus.html/english.html/ ',
      'jesus/english'
    ],
    [
      'https://www.jesusfilm.org/watch/jesus.html/english.html?utm_source=share#t=10',
      'jesus/english'
    ],
    [
      'https://www.jesusfilm.org/watch/jesus.html/spanish-latin-american.html',
      'jesus/spanish-latin-american'
    ],
    ['http://localhost:4300/watch/jesus.html/english.html', 'jesus/english']
  ])('strips %s to the variant slug %s', (url, slug) => {
    expect(parseWatchUrl(url)).toBe(slug)
  })

  it.each([
    'https://www.jesusfilm.org/watch/jesus.html',
    'https://www.jesusfilm.org/watch',
    'https://www.jesusfilm.org/about/jesus.html/english.html',
    'https://www.youtube.com/watch?v=jQaN9DvFTbw',
    'ftp://www.jesusfilm.org/watch/jesus.html/english.html',
    'jesus/english',
    ''
  ])('is null for %s, not a Watch address', (url) => {
    expect(parseWatchUrl(url)).toBeNull()
  })
})

describe('resolveWatchUrl', () => {
  beforeEach(() => {
    vi.mocked(fetchWatchVideoBySlug).mockReset()
  })

  it('resolves the variant slug to the Video id through the gateway', async () => {
    vi.mocked(fetchWatchVideoBySlug).mockResolvedValue({
      id: '1_jf-0-0',
      label: 'featureFilm',
      childrenCount: 61
    })

    await expect(
      resolveWatchUrl('https://www.jesusfilm.org/watch/jesus.html/english.html')
    ).resolves.toBe('1_jf-0-0')
    expect(fetchWatchVideoBySlug).toHaveBeenCalledWith('jesus/english')
  })

  it('is BAD_USER_INPUT on url for a slug the gateway does not resolve', async () => {
    vi.mocked(fetchWatchVideoBySlug).mockResolvedValue(null)

    await expect(
      resolveWatchUrl('https://www.jesusfilm.org/watch/nope.html/english.html')
    ).rejects.toEqual(
      expect.objectContaining({
        message: WATCH_URL_ERROR,
        extensions: { code: 'BAD_USER_INPUT', field: 'url' }
      })
    )
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
