import { vi } from 'vitest'

import type { Journey } from '../journeySchema'
import { mediaJourney } from '../journeySchema/examples'

import {
  type ImageDeps,
  type PhotoCandidate,
  resolveImages
} from './resolveImages'

function photo(n: number): PhotoCandidate {
  return {
    description: `photo ${n}`,
    src: `https://images.unsplash.com/${n}`,
    width: 100 * n,
    height: 200,
    blurhash: `hash${n}`,
    downloadLocation: `https://api.unsplash.com/download/${n}`
  }
}

function deps(overrides: Partial<ImageDeps> = {}): ImageDeps {
  return {
    searchPhotos: vi.fn(async () => [photo(1), photo(2), photo(3)]),
    choosePhotos: vi.fn(async () => ({})),
    triggerDownload: vi.fn(async () => undefined),
    ...overrides
  }
}

describe('resolveImages', () => {
  it('searches each new image and fills the chosen photo', async () => {
    const journey = structuredClone(mediaJourney)
    const imageDeps = deps({
      choosePhotos: vi.fn(async () => ({
        'cover-card:cover': 1,
        'reflect-image': 2
      }))
    })

    const warnings = await resolveImages(journey, null, imageDeps)

    expect(warnings).toEqual([])
    expect(imageDeps.searchPhotos).toHaveBeenCalledWith(
      'starry night over a small village',
      'portrait'
    )
    expect(imageDeps.searchPhotos).toHaveBeenCalledWith(
      'candle light warm',
      'landscape'
    )
    expect(journey.steps[0].card.backgroundImage).toMatchObject({
      src: 'https://images.unsplash.com/2',
      width: 200,
      blurhash: 'hash2'
    })
    const reflectImage = journey.steps[2].card.content[0]
    expect(reflectImage).toMatchObject({
      image: { src: 'https://images.unsplash.com/3' }
    })
    expect(imageDeps.triggerDownload).toHaveBeenCalledTimes(2)
  })

  it('keeps images that already have a src', async () => {
    const journey = structuredClone(mediaJourney)
    journey.steps[0].card.backgroundImage = {
      search: 'x',
      alt: 'x',
      src: 'https://images.unsplash.com/kept'
    }
    const imageDeps = deps()

    await resolveImages(journey, null, imageDeps)

    expect(imageDeps.searchPhotos).toHaveBeenCalledTimes(1)
    expect(journey.steps[0].card.backgroundImage.src).toBe(
      'https://images.unsplash.com/kept'
    )
  })

  it('copies a dropped src from the previous journey when the search is unchanged', async () => {
    const previous: Journey = structuredClone(mediaJourney)
    await resolveImages(previous, null, deps())
    const next = structuredClone(mediaJourney)
    const imageDeps = deps()

    await resolveImages(next, previous, imageDeps)

    expect(imageDeps.searchPhotos).not.toHaveBeenCalled()
    expect(next.steps[0].card.backgroundImage?.src).toBe(
      previous.steps[0].card.backgroundImage?.src
    )
  })

  it('falls back to the top result when choosing fails', async () => {
    const journey = structuredClone(mediaJourney)
    const imageDeps = deps({
      choosePhotos: vi.fn(async () => {
        throw new Error('model down')
      })
    })

    await resolveImages(journey, null, imageDeps)

    expect(journey.steps[0].card.backgroundImage?.src).toBe(
      'https://images.unsplash.com/1'
    )
  })

  it('warns and leaves the image empty when the search fails', async () => {
    const journey = structuredClone(mediaJourney)
    const imageDeps = deps({
      searchPhotos: vi.fn(async () => {
        throw new Error('gateway down')
      })
    })

    const warnings = await resolveImages(journey, null, imageDeps)

    expect(warnings).toEqual([
      'image `cover-card:cover`: photo search failed.',
      'image `reflect-image`: photo search failed.'
    ])
    expect(journey.steps[0].card.backgroundImage?.src).toBeUndefined()
  })
})
