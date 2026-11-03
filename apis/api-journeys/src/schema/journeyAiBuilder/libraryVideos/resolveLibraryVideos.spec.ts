import { shortJourney } from '../journeySchema/examples'

import { resolveLibraryVideos } from './resolveLibraryVideos'

const metadata = {
  id: '7_0-nfs0201',
  title: [{ value: 'Fact or Fiction' }],
  variant: {
    id: 'english',
    hls: 'https://stream.example/video.m3u8',
    duration: 330
  },
  images: [{ mobileCinematicHigh: 'https://images.example/poster.jpg' }]
}

describe('resolveLibraryVideos', () => {
  it('re-resolves content language IDs when the language tag changes', async () => {
    const journey = structuredClone(shortJourney) as typeof shortJourney & {
      language: { bcp47: string; id: string }
    }
    journey.language = { bcp47: 'ar', id: '529' }
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          data: {
            languages: [
              {
                id: 'arabic-language',
                bcp47: 'ar',
                name: [{ value: 'Arabic' }]
              }
            ]
          }
        })
      }))
    )
    await resolveLibraryVideos(journey, new AbortController().signal)
    expect(journey.language.id).toBe('arabic-language')
  })

  afterEach(() => vi.unstubAllGlobals())

  it('resolves each approved asset once and passes cancellation to the gateway', async () => {
    const journey = structuredClone(shortJourney)
    journey.steps[0].card.content = [
      { type: 'video', name: 'one-video', libraryVideo: 'fact-or-fiction' }
    ]
    journey.steps[1].card.content = [
      {
        type: 'video',
        name: 'two-video',
        libraryVideo: 'fact-or-fiction',
        startAt: 20,
        endAt: 60
      }
    ]
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { video: metadata } })
    })
    vi.stubGlobal('fetch', fetchMock)
    const signal = new AbortController().signal
    expect(await resolveLibraryVideos(journey, signal)).toEqual({
      'fact-or-fiction': {
        id: metadata.id,
        title: 'Fact or Fiction',
        variantId: 'english',
        hls: metadata.variant.hls,
        duration: 330,
        poster: metadata.images[0].mobileCinematicHigh
      }
    })
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        signal,
        body: expect.stringContaining('7_0-nfs0201')
      })
    )
  })

  it('rejects unavailable stream metadata instead of returning an unplayable video', async () => {
    const journey = structuredClone(shortJourney)
    journey.steps[0].card.content = [
      { type: 'video', name: 'video', libraryVideo: 'fact-or-fiction' }
    ]
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: { video: { ...metadata, variant: null } }
        })
      })
    )
    await expect(
      resolveLibraryVideos(journey, new AbortController().signal)
    ).rejects.toThrow()
  })

  it('searches the published catalogue and resolves an audio language by name', async () => {
    const journey = structuredClone(shortJourney)
    journey.steps[0].card.content = [
      {
        type: 'video',
        name: 'video',
        librarySearch: 'A Real Film',
        languageName: 'Spanish',
        startAt: 5,
        endAt: 15
      }
    ]
    const fetchMock = vi.fn(async (_url, init: RequestInit) => {
      if (typeof init.body !== 'string')
        throw new Error('Expected a JSON request body')
      const body = JSON.parse(init.body) as {
        query: string
        variables: Record<string, unknown>
      }
      if (body.query.includes('BuilderLanguage'))
        return {
          ok: true,
          json: async () => ({
            data: {
              languages: [
                { id: '21028', bcp47: 'es', name: [{ value: 'Spanish' }] }
              ]
            }
          })
        }
      if (body.query.includes('BuilderVideoSearch'))
        return {
          ok: true,
          json: async () => ({
            data: {
              videos: [{ id: 'real-film', title: [{ value: 'A Real Film' }] }]
            }
          })
        }
      expect(body.variables).toEqual({ id: 'real-film', languageId: '21028' })
      return {
        ok: true,
        json: async () => ({
          data: { video: { ...metadata, id: 'real-film' } }
        })
      }
    })
    vi.stubGlobal('fetch', fetchMock)
    const result = await resolveLibraryVideos(
      journey,
      new AbortController().signal
    )
    expect(result['search:A Real Film:Spanish']).toMatchObject({
      id: 'real-film',
      languageId: '21028',
      languageName: 'Spanish'
    })
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('asks for an exact title when a catalogue search is ambiguous', async () => {
    const journey = structuredClone(shortJourney)
    journey.steps[0].card.content = [
      { type: 'video', name: 'video', librarySearch: 'Jesus' }
    ]
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          data: {
            videos: [
              { id: 'one', title: [{ value: 'Jesus One' }] },
              { id: 'two', title: [{ value: 'Jesus Two' }] }
            ]
          }
        })
      }))
    )
    await expect(
      resolveLibraryVideos(journey, new AbortController().signal)
    ).rejects.toThrow('Choose an exact library title')
  })

  it('resolves a qualified language name using its base language search', async () => {
    const journey = structuredClone(shortJourney)
    journey.steps[0].card.content = [
      {
        type: 'video',
        name: 'video',
        libraryVideo: 'fact-or-fiction',
        languageName: 'Spanish, Castilian'
      }
    ]
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url, init: RequestInit) => {
        if (typeof init.body !== 'string') throw new Error('Expected JSON')
        const body = JSON.parse(init.body) as {
          query: string
          variables: { term?: string; languageId?: string }
        }
        if (body.query.includes('BuilderLanguage')) {
          expect(body.variables.term).toBe('Spanish')
          return {
            ok: true,
            json: async () => ({
              data: {
                languages: [
                  {
                    id: '21028',
                    bcp47: 'es',
                    name: [{ value: 'Spanish, Latin American' }]
                  },
                  {
                    id: '21046',
                    bcp47: 'es-ES',
                    name: [{ value: 'Spanish, Castilian' }]
                  }
                ]
              }
            })
          }
        }
        expect(body.variables.languageId).toBe('21046')
        return { ok: true, json: async () => ({ data: { video: metadata } }) }
      })
    )
    expect(
      (await resolveLibraryVideos(journey, new AbortController().signal))[
        'fact-or-fiction:Spanish, Castilian'
      ]
    ).toMatchObject({ languageId: '21046' })
  })

  it('checks requested clip bounds against fetched metadata for unseeded films', async () => {
    const journey = structuredClone(shortJourney)
    journey.steps[0].card.content = [
      {
        type: 'video',
        name: 'video',
        libraryVideoId: 'known-film',
        endAt: 1000
      }
    ]
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ data: { video: metadata } })
      }))
    )
    await expect(
      resolveLibraryVideos(journey, new AbortController().signal)
    ).rejects.toThrow('Clip must fit within')
  })

  it.each(['owner', 'another-user'])(
    'resolves an existing upload only for its owner (%s)',
    async (userId) => {
      const journey = structuredClone(shortJourney)
      journey.steps[0].card.content = [
        { type: 'video', name: 'video', muxVideoId: 'upload-id' }
      ]
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => ({
          ok: true,
          json: async () => ({
            data: {
              getMuxVideo: {
                id: 'upload-id',
                userId: 'owner',
                name: 'My upload',
                assetId: 'asset',
                playbackId: 'playback',
                duration: 60,
                readyToStream: true
              }
            }
          })
        }))
      )
      const result = resolveLibraryVideos(
        journey,
        new AbortController().signal,
        userId
      )
      if (userId !== 'owner') {
        await expect(result).rejects.toThrow('owned by your signed-in account')
        return
      }
      expect((await result)['mux:upload-id']).toMatchObject({
        source: 'mux',
        playbackId: 'playback',
        duration: 60
      })
    }
  )
})
