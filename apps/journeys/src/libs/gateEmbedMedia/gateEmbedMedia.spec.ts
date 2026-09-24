import { TemplateGalleryPageMediaType } from '../../../__generated__/globalTypes'

import { gateEmbedMedia } from './gateEmbedMedia'

describe('gateEmbedMedia', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      TEMPLATE_LIBRARY_EMBED_HOSTS: JSON.stringify({
        youtube: 'www.youtube.com'
      })
    }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('passes null and mux media through', () => {
    expect(gateEmbedMedia(null)).toBeNull()
    const mux = { type: TemplateGalleryPageMediaType.mux, embedUrl: null }
    expect(gateEmbedMedia(mux)).toBe(mux)
  })

  it('keeps allowlisted https link media and drops the rest', () => {
    const allowed = {
      type: TemplateGalleryPageMediaType.link,
      embedUrl: 'https://www.youtube.com/embed/abc'
    }
    expect(gateEmbedMedia(allowed)).toBe(allowed)
    expect(
      gateEmbedMedia({
        type: TemplateGalleryPageMediaType.link,
        embedUrl: 'https://evil.example.com/embed'
      })
    ).toBeNull()
    expect(
      gateEmbedMedia({
        type: TemplateGalleryPageMediaType.link,
        embedUrl: null
      })
    ).toBeNull()
  })
})
