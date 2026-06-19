import { googleSlidesSpec } from './googleSlidesValidate'

describe('googleSlidesSpec.normalize', () => {
  it('stores an already-embeddable /embed URL as-is', async () => {
    const url = 'https://docs.google.com/presentation/d/1AbC/embed'
    await expect(googleSlidesSpec.normalize(url)).resolves.toEqual({
      embedUrl: url
    })
  })

  it.each([
    // The published "Link" URL ends in /pub (or /pubhtml) and is
    // X-Frame-Options blocked; it is rewritten to the embeddable /embed form.
    [
      'https://docs.google.com/presentation/d/1AbC/pub',
      'https://docs.google.com/presentation/d/1AbC/embed'
    ],
    [
      'https://docs.google.com/presentation/d/1AbC/pubhtml',
      'https://docs.google.com/presentation/d/1AbC/embed'
    ],
    [
      'https://docs.google.com/presentation/d/e/2PACX-abc/pub',
      'https://docs.google.com/presentation/d/e/2PACX-abc/embed'
    ],
    // Query params (start / loop / delayms) survive the rewrite.
    [
      'https://docs.google.com/presentation/d/e/2PACX-abc/pub?start=false&loop=false&delayms=3000',
      'https://docs.google.com/presentation/d/e/2PACX-abc/embed?start=false&loop=false&delayms=3000'
    ]
  ])('rewrites a published /pub URL to /embed: %s', async (input, expected) => {
    await expect(googleSlidesSpec.normalize(input)).resolves.toEqual({
      embedUrl: expected
    })
  })

  it('rejects an /edit URL with GOOGLE_SLIDES_NOT_PUBLISHED', async () => {
    await expect(
      googleSlidesSpec.normalize(
        'https://docs.google.com/presentation/d/1AbC/edit'
      )
    ).rejects.toMatchObject({
      extensions: {
        code: 'BAD_USER_INPUT',
        reason: 'GOOGLE_SLIDES_NOT_PUBLISHED'
      }
    })
  })

  it.each([
    // Document id starts with "pub"/"embed" but this is the private editor URL —
    // must NOT be treated as published (the NES-1660 substring-match regression).
    'https://docs.google.com/presentation/d/pubXYZ/edit',
    'https://docs.google.com/presentation/d/embedXYZ/edit'
  ])(
    'rejects a private /edit URL whose id starts with pub/embed: %s',
    async (url) => {
      await expect(googleSlidesSpec.normalize(url)).rejects.toMatchObject({
        extensions: { reason: 'GOOGLE_SLIDES_NOT_PUBLISHED' }
      })
    }
  )

  it('rejects a /preview URL with GOOGLE_SLIDES_NOT_PUBLISHED', async () => {
    await expect(
      googleSlidesSpec.normalize(
        'https://docs.google.com/presentation/d/1AbC/preview'
      )
    ).rejects.toMatchObject({
      extensions: { reason: 'GOOGLE_SLIDES_NOT_PUBLISHED' }
    })
  })

  it('rejects a non-presentation path with BAD_USER_INPUT', async () => {
    await expect(
      googleSlidesSpec.normalize('https://docs.google.com/document/d/1AbC/pub')
    ).rejects.toMatchObject({
      extensions: {
        code: 'BAD_USER_INPUT',
        reason: 'GOOGLE_SLIDES_INVALID_URL'
      }
    })
  })

  it('rejects a non-docs host with BAD_USER_INPUT', async () => {
    await expect(
      googleSlidesSpec.normalize(
        'https://evil.example.com/presentation/d/1AbC/pub'
      )
    ).rejects.toMatchObject({
      extensions: {
        code: 'BAD_USER_INPUT',
        reason: 'GOOGLE_SLIDES_INVALID_URL'
      }
    })
  })
})
