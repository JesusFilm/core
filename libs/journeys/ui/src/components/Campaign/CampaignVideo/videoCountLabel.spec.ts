import type { TFunction } from 'next-i18next/pages'

import { videoCountLabel } from './videoCountLabel'

const t = vi.fn((key: string, options?: { count: number }) =>
  key.replace('{{count}}', String(options?.count))
) as unknown as TFunction

describe('videoCountLabel', () => {
  it('puts the count before the campaign word in the Page Language', () => {
    expect(videoCountLabel(61, 'vidéos', t)).toBe('61 vidéos')
  })

  it('interpolates the count through the interface translation without a campaign word', () => {
    expect(videoCountLabel(61, '', t)).toBe('61 videos')
  })
})
