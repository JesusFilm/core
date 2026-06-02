import { TFunction } from 'i18next'

import { mediaErrorMessage } from './mediaErrorMessage'

// Identity translator — returns the key unchanged so assertions read the
// English source string.
const t = ((key: string) => key) as unknown as TFunction

describe('mediaErrorMessage', () => {
  it('maps known reasons to specific messages', () => {
    expect(mediaErrorMessage('YOUTUBE_PRIVATE', t)).toMatch(/private/i)
    expect(mediaErrorMessage('YOUTUBE_UNAVAILABLE', t)).toMatch(/cannot be embedded/i)
    expect(mediaErrorMessage('CANVA_UNAVAILABLE', t)).toMatch(/canva/i)
    expect(mediaErrorMessage('GOOGLE_SLIDES_NOT_PUBLISHED', t)).toMatch(
      /publish to web/i
    )
    expect(mediaErrorMessage('EMBED_HOST_NOT_ALLOWED', t)).toMatch(/cannot embed/i)
    expect(mediaErrorMessage('MUX_NOT_READY', t)).toMatch(/processing/i)
  })

  it('falls back to a generic message for an unknown reason', () => {
    expect(mediaErrorMessage('SOMETHING_NEW', t)).toMatch(/couldn't add that media/i)
  })
})
