import { InMemoryCache } from '@apollo/client'

import { evictFromTemplateGalleryPages } from './evictFromTemplateGalleryPages'

function seedCache(): InMemoryCache {
  const cache = new InMemoryCache()
  cache.restore({
    'TemplateGalleryPage:page-A': {
      __typename: 'TemplateGalleryPage',
      id: 'page-A',
      templates: [
        { __ref: 'TemplateGalleryItem:journey-1' },
        { __ref: 'TemplateGalleryItem:journey-other' }
      ]
    },
    'TemplateGalleryPage:page-B': {
      __typename: 'TemplateGalleryPage',
      id: 'page-B',
      templates: [{ __ref: 'TemplateGalleryItem:journey-1' }]
    },
    'TemplateGalleryItem:journey-1': {
      __typename: 'TemplateGalleryItem',
      id: 'journey-1'
    },
    'TemplateGalleryItem:journey-other': {
      __typename: 'TemplateGalleryItem',
      id: 'journey-other'
    },
    'Journey:journey-1': {
      __typename: 'Journey',
      id: 'journey-1'
    }
  })
  return cache
}

describe('evictFromTemplateGalleryPages', () => {
  it('removes the ref from every TemplateGalleryPage templates list', () => {
    const cache = seedCache()
    evictFromTemplateGalleryPages(cache, ['journey-1'])
    const snapshot = cache.extract()
    expect(snapshot['TemplateGalleryPage:page-A']?.templates).toEqual([
      { __ref: 'TemplateGalleryItem:journey-other' }
    ])
    expect(snapshot['TemplateGalleryPage:page-B']?.templates).toEqual([])
  })

  it('evicts both Journey and TemplateGalleryItem entities by default', () => {
    const cache = seedCache()
    evictFromTemplateGalleryPages(cache, ['journey-1'])
    const snapshot = cache.extract()
    expect(snapshot['Journey:journey-1']).toBeUndefined()
    expect(snapshot['TemplateGalleryItem:journey-1']).toBeUndefined()
  })

  it('preserves the Journey entity when evictJourneyEntity is false', () => {
    const cache = seedCache()
    evictFromTemplateGalleryPages(cache, ['journey-1'], {
      evictJourneyEntity: false
    })
    const snapshot = cache.extract()
    expect(snapshot['Journey:journey-1']).toBeDefined()
    expect(snapshot['TemplateGalleryItem:journey-1']).toBeUndefined()
    // List filtering still applies.
    expect(snapshot['TemplateGalleryPage:page-A']?.templates).toEqual([
      { __ref: 'TemplateGalleryItem:journey-other' }
    ])
  })

  it('no-ops when journeyIds is empty', () => {
    const cache = seedCache()
    const before = cache.extract()
    evictFromTemplateGalleryPages(cache, [])
    expect(cache.extract()).toEqual(before)
  })
})
