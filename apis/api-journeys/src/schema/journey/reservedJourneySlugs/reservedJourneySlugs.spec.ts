import { readdirSync } from 'fs'
import { createRequire } from 'module'
import { join } from 'path'

import slugify from 'slugify'

import {
  VIEWER_RESERVED_SEGMENTS,
  isReservedJourneySlug
} from './reservedJourneySlugs'

const VIEWER_ROOT = join(__dirname, '../../../../../../apps/journeys')

describe('isReservedJourneySlug', () => {
  it('reserves every first path segment the viewer owns', () => {
    for (const segment of [
      'embed',
      'legal',
      'plausible',
      'campaign',
      'template-gallery',
      'api',
      'fr',
      'zh-hans-cn'
    ]) {
      expect(VIEWER_RESERVED_SEGMENTS.has(segment)).toBe(true)
      expect(isReservedJourneySlug(segment)).toBe(true)
    }
  })

  it('allows any other slug', () => {
    expect(isReservedJourneySlug('campaign-2026')).toBe(false)
    expect(isReservedJourneySlug('my-journey')).toBe(false)
  })

  it('can match every entry once slugified', () => {
    // `_next` is reserved for the viewer's route matcher; slugify strips its
    // underscore, so no slug can ever equal it.
    for (const segment of VIEWER_RESERVED_SEGMENTS) {
      if (segment === '_next') continue
      expect(slugify(segment, { lower: true, strict: true })).toBe(segment)
    }
  })
})

describe('VIEWER_RESERVED_SEGMENTS against apps/journeys', () => {
  it('reserves every static folder under pages/home', () => {
    const staticFolders = readdirSync(join(VIEWER_ROOT, 'pages/home'), {
      withFileTypes: true
    })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('['))
      .map((entry) => entry.name)

    expect(staticFolders.length).toBeGreaterThan(0)
    for (const folder of staticFolders) {
      expect(VIEWER_RESERVED_SEGMENTS.has(folder)).toBe(true)
    }
  })

  it('reserves pages/api and the plausible bypass', () => {
    expect(readdirSync(join(VIEWER_ROOT, 'pages/api')).length).toBeGreaterThan(
      0
    )
    expect(VIEWER_RESERVED_SEGMENTS.has('api')).toBe(true)
    expect(VIEWER_RESERVED_SEGMENTS.has('plausible')).toBe(true)
  })

  it('reserves every i18n locale Next strips from the path', () => {
    const loadViewerFile = createRequire(__filename)
    const { i18n } = loadViewerFile(
      join(VIEWER_ROOT, 'next-i18next.config.js')
    ) as { i18n: { locales: string[] } }

    expect(i18n.locales.length).toBeGreaterThan(0)
    for (const locale of i18n.locales) {
      expect(
        VIEWER_RESERVED_SEGMENTS.has(
          slugify(locale, { lower: true, strict: true })
        )
      ).toBe(true)
    }
  })
})
