import { GetTemplateGalleryPages_templateGalleryPages_media as TemplateGalleryPageMedia } from '../../../../../__generated__/GetTemplateGalleryPages'
import { TemplateGalleryPageMediaType } from '../../../../../__generated__/globalTypes'

import {
  CollectionMediaValues,
  EMPTY_MEDIA,
  collectionMediaToFormValues,
  formMediaToInput,
  mediaDirty
} from './collectionMedia'

function row(
  overrides: Partial<TemplateGalleryPageMedia>
): TemplateGalleryPageMedia {
  return {
    __typename: 'TemplateGalleryPageMedia',
    id: 'media-1',
    type: TemplateGalleryPageMediaType.none,
    embedUrl: null,
    muxVideoId: null,
    muxPlaybackId: null,
    muxName: null,
    muxDuration: null,
    ...overrides
  }
}

function form(
  overrides: Partial<CollectionMediaValues> = {}
): CollectionMediaValues {
  return { ...EMPTY_MEDIA, ...overrides }
}

describe('collectionMediaToFormValues', () => {
  it('maps a link row to a link slot', () => {
    const v = collectionMediaToFormValues(
      row({
        type: TemplateGalleryPageMediaType.link,
        embedUrl: 'https://x.test/a'
      })
    )
    expect(v).toMatchObject({
      type: TemplateGalleryPageMediaType.link,
      url: 'https://x.test/a',
      muxVideoId: ''
    })
  })

  it('maps a mux row to a mux slot including muxVideoId', () => {
    const v = collectionMediaToFormValues(
      row({
        type: TemplateGalleryPageMediaType.mux,
        muxVideoId: 'vid-1',
        muxPlaybackId: 'pb-1',
        muxName: 'Clip',
        muxDuration: 12
      })
    )
    expect(v).toMatchObject({
      type: TemplateGalleryPageMediaType.mux,
      url: '',
      muxVideoId: 'vid-1',
      muxPlaybackId: 'pb-1',
      muxName: 'Clip',
      muxDuration: 12
    })
  })

  it('seeds BOTH parked slots when the row retains both payloads', () => {
    const v = collectionMediaToFormValues(
      row({
        type: TemplateGalleryPageMediaType.link,
        embedUrl: 'https://x.test/a',
        muxVideoId: 'vid-9',
        muxPlaybackId: 'pb-9'
      })
    )
    expect(v.type).toBe(TemplateGalleryPageMediaType.link)
    expect(v.url).toBe('https://x.test/a')
    expect(v.muxVideoId).toBe('vid-9') // parked upload preserved
    expect(v.muxPlaybackId).toBe('pb-9')
  })

  it('maps a null row to empty none', () => {
    expect(collectionMediaToFormValues(null)).toEqual(EMPTY_MEDIA)
  })
})

describe('mediaDirty', () => {
  it('is false when nothing changed', () => {
    const base = form({
      type: TemplateGalleryPageMediaType.link,
      url: 'https://x.test/a'
    })
    expect(mediaDirty(base, base)).toBe(false)
  })

  it('detects a type change', () => {
    const persisted = form({
      type: TemplateGalleryPageMediaType.link,
      url: 'https://x.test/a'
    })
    expect(
      mediaDirty(
        { ...persisted, type: TemplateGalleryPageMediaType.none },
        persisted
      )
    ).toBe(true)
  })

  it('ignores whitespace-only differences in the link', () => {
    const persisted = form({
      type: TemplateGalleryPageMediaType.link,
      url: 'https://x.test/a'
    })
    expect(
      mediaDirty({ ...persisted, url: ' https://x.test/a ' }, persisted)
    ).toBe(false)
  })
})

describe('formMediaToInput', () => {
  it('always sends type and omits unchanged slots', () => {
    const persisted = form({
      type: TemplateGalleryPageMediaType.link,
      url: 'https://x.test/a'
    })
    expect(formMediaToInput(persisted, persisted)).toEqual({
      type: TemplateGalleryPageMediaType.link
    })
  })

  it('sends a changed link, trimmed', () => {
    const persisted = form({
      type: TemplateGalleryPageMediaType.link,
      url: 'https://old.test'
    })
    const current = form({
      type: TemplateGalleryPageMediaType.link,
      url: '  https://new.test  '
    })
    expect(formMediaToInput(current, persisted)).toEqual({
      type: TemplateGalleryPageMediaType.link,
      url: 'https://new.test'
    })
  })

  it('sends url:null when the link is cleared', () => {
    const persisted = form({
      type: TemplateGalleryPageMediaType.link,
      url: 'https://old.test'
    })
    const current = form({ type: TemplateGalleryPageMediaType.link, url: '' })
    expect(formMediaToInput(current, persisted)).toEqual({
      type: TemplateGalleryPageMediaType.link,
      url: null
    })
  })

  it('sends a fresh upload videoId', () => {
    const persisted = form({ type: TemplateGalleryPageMediaType.none })
    const current = form({
      type: TemplateGalleryPageMediaType.mux,
      muxVideoId: 'vid-new'
    })
    expect(formMediaToInput(current, persisted)).toEqual({
      type: TemplateGalleryPageMediaType.mux,
      muxVideoId: 'vid-new'
    })
  })

  it('sends muxVideoId:null when an existing upload is removed', () => {
    const persisted = form({
      type: TemplateGalleryPageMediaType.mux,
      muxVideoId: 'vid-1',
      muxPlaybackId: 'pb-1'
    })
    const current = form({
      type: TemplateGalleryPageMediaType.mux,
      muxVideoId: ''
    })
    expect(formMediaToInput(current, persisted)).toEqual({
      type: TemplateGalleryPageMediaType.mux,
      muxVideoId: null
    })
  })

  it('omits muxVideoId for an untouched existing upload', () => {
    const persisted = form({
      type: TemplateGalleryPageMediaType.mux,
      muxVideoId: 'vid-1',
      muxPlaybackId: 'pb-1'
    })
    expect(formMediaToInput(persisted, persisted)).toEqual({
      type: TemplateGalleryPageMediaType.mux
    })
  })

  it('sends only type when switching to none with both slots unchanged', () => {
    const persisted = form({
      type: TemplateGalleryPageMediaType.link,
      url: 'https://x.test/a',
      muxVideoId: 'vid-1',
      muxPlaybackId: 'pb-1'
    })
    const current = { ...persisted, type: TemplateGalleryPageMediaType.none }
    expect(formMediaToInput(current, persisted)).toEqual({
      type: TemplateGalleryPageMediaType.none
    })
  })
})
