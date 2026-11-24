import { readFileSync } from 'fs'
import { resolve } from 'path'

import type { TFunction } from 'next-i18next/pages'

import { videoCountLabel } from './videoCountLabel'

const t = vi.fn((key: string, options?: { count: number }) =>
  key.replace('{{count}}', String(options?.count))
) as unknown as TFunction

describe('videoCountLabel', () => {
  it('puts the count before the campaign word in the Page Language', () => {
    expect(videoCountLabel(61, 'vidéos', t)).toBe('61 vidéos')
  })

  it('places the count where the campaign word has a {{count}} slot', () => {
    expect(videoCountLabel(61, 'Videos: {{count}}', t)).toBe('Videos: 61')
  })

  it('interpolates the count through the interface translation without a campaign word', () => {
    expect(videoCountLabel(61, '', t)).toBe('61 videos')
  })

  it('has a readable plural for each count in the English locale file', () => {
    const locale = JSON.parse(
      readFileSync(
        resolve(
          __dirname,
          '../../../../../../../libs/locales/en/libs-journeys-ui.json'
        ),
        'utf8'
      )
    ) as Record<string, string>
    expect(locale['{{count}} videos_one']).toBe('{{count}} video')
    expect(locale['{{count}} videos_other']).toBe('{{count}} videos')
  })
})
