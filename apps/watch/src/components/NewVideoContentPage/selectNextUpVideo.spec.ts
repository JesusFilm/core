import { VideoLabel } from '../../../__generated__/globalTypes'

import { selectNextUpVideo } from './selectNextUpVideo'

describe('selectNextUpVideo', () => {
  const baseChild = {
    id: 'child-1',
    label: VideoLabel.featureFilm,
    title: [{ value: 'First Child' }],
    images: [{ mobileCinematicHigh: 'image.jpg' }],
    imageAlt: [{ value: 'Alt text' }],
    snippet: [],
    slug: 'child-1',
    variant: { id: 'var-1', duration: 120, hls: 'hls', slug: 'slug-1/en' },
    childrenCount: 0
  }

  it('returns the first child that does not match the current video', () => {
    const result = selectNextUpVideo({
      currentVideoId: 'current',
      children: [
        { ...baseChild, id: 'current' },
        baseChild,
        { ...baseChild, id: 'child-2', title: [{ value: 'Second Child' }] }
      ] as any,
      containerSlug: 'series/example',
      containerLabel: null
    })

    expect(result).toMatchObject({
      id: 'child-1',
      title: 'First Child',
      href: '/watch/series/example.html/slug-1/en.html'
    })
  })

  it('falls back to container label when child label is missing', () => {
    const result = selectNextUpVideo({
      currentVideoId: 'current',
      children: [{ ...baseChild, id: 'child-3', label: null }] as any,
      containerSlug: 'video/example',
      containerLabel: VideoLabel.featureFilm
    })

    expect(result?.href).toBe('/watch/video/example.html/slug-1/en.html')
  })

  it('returns null when there is no suitable next video', () => {
    const result = selectNextUpVideo({
      currentVideoId: 'current',
      children: [
        { ...baseChild, id: 'current' },
        { ...baseChild, id: 'child-4', variant: null }
      ] as any,
      containerSlug: 'video/example',
      containerLabel: null
    })

    expect(result).toBeNull()
  })
})
