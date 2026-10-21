import { GraphQLError } from 'graphql'
import { z } from 'zod'

import {
  CampaignAlign,
  CampaignBackgroundKind,
  CampaignBackgroundOverlay,
  CampaignButtonVariant,
  CampaignColumnsRatio,
  CampaignFeaturedMediaLayout,
  CampaignJourneyListDisplay,
  CampaignMediaSide,
  CampaignRadius,
  CampaignStringKey,
  CampaignSwitcherVariant,
  CampaignTypographyVariant,
  Prisma,
  VideoBlockSource
} from '@core/prisma/journeys/client'

import { prismaMock } from '../../../test/prismaMock'

import {
  LINK_URL_MAX_LENGTH,
  REGION_RESERVED_SLUGS,
  RESERVED_SLUGS,
  SLUG_MAX_LENGTH,
  SLUG_PATTERN,
  TEXT_CAPS,
  assertClientId,
  assertClientIds,
  assertEnum,
  assertEnumOrNull,
  assertHex,
  assertHexOrNull,
  assertLength,
  assertLengthOrNull,
  assertLinkUrl,
  assertNotNull,
  assertPalette,
  assertRegionCountries,
  assertUniqueIds,
  generateUniqueCampaignSlug,
  generateUniqueRegionSlug,
  isUniqueViolation,
  parseWithZod,
  truncate,
  validateCampaignSlug,
  validateRegionSlug
} from './validation'

function expectBadUserInput(fn: () => unknown, field: string): void {
  let caught: unknown
  try {
    fn()
  } catch (error) {
    caught = error
  }
  expect(caught).toBeInstanceOf(GraphQLError)
  expect((caught as GraphQLError).extensions).toMatchObject({
    code: 'BAD_USER_INPUT',
    field
  })
}

async function expectBadUserInputAsync(
  promise: Promise<unknown>,
  field: string
): Promise<void> {
  await expect(promise).rejects.toMatchObject({
    extensions: { code: 'BAD_USER_INPUT', field }
  })
}

describe('campaign validation', () => {
  describe('assertHex', () => {
    it('trims and stores a normalised #RRGGBB uppercase value', () => {
      expect(assertHex('  #c52d3a  ', 'primaryColor')).toBe('#C52D3A')
    })

    it('accepts #RGB in any case and expands it to #RRGGBB', () => {
      expect(assertHex('#aBc', 'color')).toBe('#AABBCC')
    })

    it('accepts #RRGGBB in any case', () => {
      expect(assertHex('#FfFfFf', 'color')).toBe('#FFFFFF')
    })

    it.each([
      ['a named colour', 'red'],
      ['rgb()', 'rgb(197, 45, 58)'],
      ['8-digit alpha', '#C52D3A80'],
      ['a missing hash', 'C52D3A'],
      ['an empty string', '']
    ])(
      'rejects %s with BAD_USER_INPUT and the column as field',
      (_label, value) => {
        expectBadUserInput(
          () => assertHex(value, 'backgroundColor'),
          'backgroundColor'
        )
      }
    )

    it('lets a nullable column accept null, never ""', () => {
      expect(assertHexOrNull(null, 'color')).toBeNull()
      expect(assertHexOrNull(undefined, 'color')).toBeUndefined()
      expect(assertHexOrNull('#abc', 'color')).toBe('#AABBCC')
      expectBadUserInput(() => assertHexOrNull('', 'color'), 'color')
    })
  })

  describe('truncate', () => {
    it('cuts to the cap in code points, so an emoji counts as one', () => {
      expect(truncate('😀'.repeat(5), 3)).toBe('😀'.repeat(3))
    })

    it('returns a value at or under the cap unchanged', () => {
      expect(truncate('abc', 3)).toBe('abc')
      expect(truncate('', 3)).toBe('')
    })
  })

  describe('assertLength', () => {
    it.each([
      ['Campaign.title', 'title', TEXT_CAPS.campaignTitle, 100, true],
      ['CampaignRegion.name', 'name', TEXT_CAPS.regionName, 60, true],
      ['section eyebrow', 'eyebrow', TEXT_CAPS.eyebrow, 80, false],
      ['section title', 'title', TEXT_CAPS.title, 150, false],
      ['section description', 'description', TEXT_CAPS.description, 500, false],
      ['section intro', 'intro', TEXT_CAPS.intro, 500, false],
      ['bullets', 'bullets', TEXT_CAPS.bullets, 1000, false],
      ['rich text content', 'content', TEXT_CAPS.richTextContent, 5000, false],
      [
        'CampaignTypographyBlock.content',
        'content',
        TEXT_CAPS.typographyContent,
        2000,
        false
      ],
      ['CampaignButtonBlock.label', 'label', TEXT_CAPS.buttonLabel, 60, false],
      ['CampaignString.value', 'value', TEXT_CAPS.stringValue, 200, false],
      ['CampaignImageBlock.alt', 'alt', TEXT_CAPS.imageAlt, 500, false],
      ['CampaignVideoBlock.title', 'title', TEXT_CAPS.videoTitle, 200, false],
      [
        'CampaignVideoBlock.description',
        'description',
        TEXT_CAPS.videoDescription,
        1000,
        false
      ],
      [
        'CampaignJourneyBlock.title',
        'title',
        TEXT_CAPS.journeyTitle,
        200,
        false
      ],
      [
        'CampaignJourneyBlock.description',
        'description',
        TEXT_CAPS.journeyDescription,
        1000,
        false
      ]
    ])(
      '%s is capped at %s characters (%s)',
      (_label, field, cap, expected, required) => {
        expect(cap).toBe(expected)
        // Unicode code points after trim: an emoji is one character, not two
        // UTF-16 units, so a string of exactly `cap` emoji passes.
        const atCap = '😀'.repeat(cap)
        expect(assertLength(`  ${atCap}  `, field, cap, { required })).toBe(
          atCap
        )
        expectBadUserInput(
          () => assertLength('😀'.repeat(cap + 1), field, cap, { required }),
          field
        )
        if (required) {
          expectBadUserInput(
            () => assertLength('   ', field, cap, { required }),
            field
          )
        } else {
          expect(assertLength('   ', field, cap)).toBe('')
        }
      }
    )

    it('lets a nullable text column accept null', () => {
      expect(assertLengthOrNull(null, 'eyebrow', TEXT_CAPS.eyebrow)).toBeNull()
      expect(assertLengthOrNull(' hi ', 'eyebrow', TEXT_CAPS.eyebrow)).toBe(
        'hi'
      )
    })
  })

  describe('assertLinkUrl', () => {
    it('passes an https url of at most 2048 characters', () => {
      const url = `https://example.com/${'a'.repeat(LINK_URL_MAX_LENGTH - 20)}`
      expect(url.length).toBe(LINK_URL_MAX_LENGTH)
      expect(assertLinkUrl(` ${url} `)).toBe(url)
    })

    it('rejects a non-https url with BAD_USER_INPUT, field url', () => {
      expectBadUserInput(() => assertLinkUrl('http://example.com'), 'url')
      expectBadUserInput(() => assertLinkUrl('not a url'), 'url')
    })

    it('rejects a url over 2048 characters with BAD_USER_INPUT, field url', () => {
      const url = `https://example.com/${'a'.repeat(LINK_URL_MAX_LENGTH)}`
      expectBadUserInput(() => assertLinkUrl(url), 'url')
    })
  })

  describe('assertPalette', () => {
    it('normalises every entry, deduplicates and caps at 8', () => {
      expect(
        assertPalette([
          '#abc',
          '#AABBCC',
          '#111111',
          '#222222',
          '#333333',
          '#444444',
          '#555555',
          '#666666',
          '#777777',
          '#888888'
        ])
      ).toEqual([
        '#AABBCC',
        '#111111',
        '#222222',
        '#333333',
        '#444444',
        '#555555',
        '#666666',
        '#777777'
      ])
    })

    it('rejects a bad entry with BAD_USER_INPUT, field palette', () => {
      expectBadUserInput(() => assertPalette(['#abc', 'red']), 'palette')
    })
  })

  describe('duplicates and counts', () => {
    it('rejects a duplicate language with BAD_USER_INPUT, field languageId', () => {
      expect(assertUniqueIds(['529', '21028'], 'languageId')).toEqual([
        '529',
        '21028'
      ])
      expectBadUserInput(
        () => assertUniqueIds(['529', '21028', '529'], 'languageId'),
        'languageId'
      )
    })

    it('rejects a duplicate country with BAD_USER_INPUT, field countryId', () => {
      expectBadUserInput(
        () => assertRegionCountries(['FR', 'DE', 'FR']),
        'countryId'
      )
    })

    it('allows up to 250 countries per region and rejects 251', () => {
      const ids = Array.from({ length: 250 }, (_, i) => `country-${i}`)
      expect(assertRegionCountries(ids)).toEqual(ids)
      expectBadUserInput(
        () => assertRegionCountries([...ids, 'country-250']),
        'countryId'
      )
    })
  })

  describe('assertNotNull', () => {
    it('leaves an omitted field alone', () => {
      expect(assertNotNull(undefined, 'showMap')).toBeUndefined()
    })

    it('passes a value through, falsy ones included', () => {
      expect(assertNotNull(false, 'showMap')).toBe(false)
      expect(assertNotNull('', 'title')).toBe('')
      expect(assertNotNull('grid', 'display')).toBe('grid')
    })

    it('refuses an explicit null with BAD_USER_INPUT on the field', () => {
      expect(() => assertNotNull(null, 'showMap')).toThrow(
        'showMap cannot be null'
      )
      expectBadUserInput(() => assertNotNull(null, 'showMap'), 'showMap')
    })
  })

  describe('client-chosen ids', () => {
    const FIRST = '6f1c2d3e-4a5b-4c6d-8e7f-9a0b1c2d3e4f'
    const SECOND = '7a2b3c4d-5e6f-4a7b-9c8d-0e1f2a3b4c5d'

    it('takes distinct UUIDs', () => {
      expect(assertClientIds([FIRST, SECOND], 'slotIds')).toEqual([
        FIRST,
        SECOND
      ])
      expect(assertClientId(FIRST)).toBe(FIRST)
    })

    it('leaves an omitted id to the server', () => {
      expect(assertClientId(undefined)).toBeUndefined()
      expect(assertClientId(null)).toBeUndefined()
    })

    it.each(['', 'not-a-uuid', 'heroId'])(
      'refuses %j, which is not a UUID',
      (id) => {
        expectBadUserInput(() => assertClientId(id), 'id')
        expectBadUserInput(() => assertClientIds([FIRST, id], 'idMap'), 'idMap')
      }
    )

    it('refuses the same id twice in one call, ids the call already chose included', () => {
      expectBadUserInput(
        () => assertClientIds([FIRST, FIRST], 'slotIds'),
        'slotIds'
      )
      expectBadUserInput(
        () => assertClientIds([FIRST, SECOND], 'slotIds', [SECOND]),
        'slotIds'
      )
    })
  })

  describe('isUniqueViolation', () => {
    function p2002(meta: Record<string, unknown>): unknown {
      return new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: 'test',
          meta
        }
      )
    }

    it('reads the columns from the driver adapter constraint', () => {
      const error = p2002({
        driverAdapterError: {
          cause: {
            kind: 'UniqueConstraintViolation',
            constraint: { fields: ['id'] }
          }
        }
      })
      expect(isUniqueViolation(error, 'id')).toBe(true)
      expect(isUniqueViolation(error, 'slug')).toBe(false)
    })

    it('reads a quoted mixed-case column from the driver adapter', () => {
      const error = p2002({
        driverAdapterError: {
          cause: { constraint: { fields: ['"coverBlockId"'] } }
        }
      })
      expect(isUniqueViolation(error, 'coverBlockId')).toBe(true)
    })

    it('reads the columns from meta.target', () => {
      expect(isUniqueViolation(p2002({ target: ['id'] }), 'id')).toBe(true)
    })

    it('is false for any other error', () => {
      expect(isUniqueViolation(new Error('id'), 'id')).toBe(false)
      expect(
        isUniqueViolation(
          new Prisma.PrismaClientKnownRequestError('Not found', {
            code: 'P2025',
            clientVersion: 'test',
            meta: { target: ['id'] }
          }),
          'id'
        )
      ).toBe(false)
    })
  })

  describe('assertEnum', () => {
    it.each([
      ['backgroundKind', Object.values(CampaignBackgroundKind)],
      ['variant (region switcher)', Object.values(CampaignSwitcherVariant)],
      ['variant (typography)', Object.values(CampaignTypographyVariant)],
      ['variant (button)', Object.values(CampaignButtonVariant)],
      ['align', Object.values(CampaignAlign)],
      ['ratio', Object.values(CampaignColumnsRatio)],
      ['display', Object.values(CampaignJourneyListDisplay)],
      ['mediaSide', Object.values(CampaignMediaSide)],
      ['layout', Object.values(CampaignFeaturedMediaLayout)],
      ['radius', Object.values(CampaignRadius)],
      ['buttonRadius', Object.values(CampaignRadius)],
      ['source', Object.values(VideoBlockSource)],
      ['backgroundOverlay', Object.values(CampaignBackgroundOverlay)],
      ['key', Object.values(CampaignStringKey)],
      [
        'field',
        ['eyebrow', 'title', 'description', 'bullets', 'content', 'intro']
      ]
    ])(
      "%s takes its enum's values only, else BAD_USER_INPUT with the column as field",
      (column, values) => {
        const field = column.split(' ')[0]
        for (const value of values)
          expect(assertEnum(value, field, values)).toBe(value)
        expectBadUserInput(() => assertEnum('bogus', field, values), field)
        expectBadUserInput(() => assertEnum('', field, values), field)
      }
    )

    it('lets a nullable enum column accept null', () => {
      const values = Object.values(CampaignAlign)
      expect(assertEnumOrNull(null, 'align', values)).toBeNull()
      expect(assertEnumOrNull('left', 'align', values)).toBe('left')
      expectBadUserInput(
        () => assertEnumOrNull('middle', 'align', values),
        'align'
      )
    })
  })

  describe('parseWithZod', () => {
    const schema = z.object({
      videoId: z
        .string()
        .regex(/^[\w-]{11}$/, 'videoId must be a valid YouTube videoId')
    })

    it('returns the parsed value on success', () => {
      expect(parseWithZod(schema, { videoId: 'dQw4w9WgXcQ' }, 'url')).toEqual({
        videoId: 'dQw4w9WgXcQ'
      })
    })

    it('turns a zod failure into BAD_USER_INPUT with field from the first issue path', () => {
      let caught: GraphQLError | undefined
      try {
        parseWithZod(schema, { videoId: 'nope' }, 'url')
      } catch (error) {
        caught = error as GraphQLError
      }
      expect(caught?.extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'videoId'
      })
      expect(caught?.message).toBe('videoId must be a valid YouTube videoId')
    })

    it('falls back to the given field for a top-level issue', () => {
      expectBadUserInput(() => parseWithZod(z.string(), 42, 'url'), 'url')
    })
  })

  describe('campaign slug', () => {
    beforeEach(() => {
      prismaMock.campaign.findMany.mockResolvedValue([])
      prismaMock.campaign.findFirst.mockResolvedValue(null)
    })

    it('generates the slug from the title with slugify lower strict', async () => {
      await expect(generateUniqueCampaignSlug('Outreach 2026!')).resolves.toBe(
        'outreach-2026'
      )
      expect(prismaMock.campaign.findMany).toHaveBeenCalledWith({
        where: { slug: { startsWith: 'outreach-2026' } },
        select: { slug: true }
      })
    })

    it('appends -2…-50 on collision', async () => {
      prismaMock.campaign.findMany.mockResolvedValue([
        { slug: 'outreach' },
        { slug: 'outreach-2' }
      ] as any)
      await expect(generateUniqueCampaignSlug('Outreach')).resolves.toBe(
        'outreach-3'
      )
    })

    it('falls back to a nanoid suffix once base-2…base-50 are taken', async () => {
      prismaMock.campaign.findMany.mockResolvedValue([
        { slug: 'outreach' },
        ...Array.from({ length: 49 }, (_, i) => ({
          slug: `outreach-${i + 2}`
        }))
      ] as any)
      const slug = await generateUniqueCampaignSlug('Outreach')
      expect(slug).toMatch(/^outreach-[a-z0-9]{6}$/)
      expect(SLUG_PATTERN.test(slug)).toBe(true)
    })

    it('uses the gallery SLUG_PATTERN and SLUG_MAX_LENGTH of 200', async () => {
      expect(SLUG_MAX_LENGTH).toBe(200)
      expect(SLUG_PATTERN.test('eur-2026')).toBe(true)
      expect(SLUG_PATTERN.test('EUR')).toBe(false)
      const slug = await generateUniqueCampaignSlug('a'.repeat(250))
      expect(slug).toHaveLength(200)
      await expectBadUserInputAsync(
        validateCampaignSlug('b'.repeat(201), 'campaignId'),
        'slug'
      )
    })

    it('RESERVED_SLUGS applies and now contains campaign and campaigns', async () => {
      expect(RESERVED_SLUGS.has('campaign')).toBe(true)
      expect(RESERVED_SLUGS.has('campaigns')).toBe(true)
      await expectBadUserInputAsync(
        generateUniqueCampaignSlug('Campaign'),
        'slug'
      )
      await expectBadUserInputAsync(
        generateUniqueCampaignSlug('campaigns'),
        'slug'
      )
      await expectBadUserInputAsync(
        validateCampaignSlug('admin', 'campaignId'),
        'slug'
      )
    })

    it('is author-editable through the gallery author-slug validation', async () => {
      await expect(
        validateCampaignSlug(' Outreach 2026 ', 'campaignId')
      ).resolves.toBe('outreach-2026')
      expect(prismaMock.campaign.findFirst).toHaveBeenCalledWith({
        where: { slug: 'outreach-2026', NOT: { id: 'campaignId' } },
        select: { id: true }
      })
      await expectBadUserInputAsync(
        validateCampaignSlug('!!!', 'campaignId'),
        'slug'
      )
    })

    it('keeps slug collisions as BAD_USER_INPUT, field slug', async () => {
      prismaMock.campaign.findFirst.mockResolvedValue({ id: 'other' } as any)
      await expectBadUserInputAsync(
        validateCampaignSlug('outreach', 'campaignId'),
        'slug'
      )
    })
  })

  describe('region slug', () => {
    beforeEach(() => {
      prismaMock.campaignRegion.findMany.mockResolvedValue([])
      prismaMock.journey.findMany.mockResolvedValue([])
      prismaMock.campaignRegion.findFirst.mockResolvedValue(null)
    })

    const campaign = { id: 'campaignId', teamId: 'teamId' }

    it('generates the slug from the name, unique per campaign', async () => {
      prismaMock.campaignRegion.findMany.mockResolvedValue([
        { slug: 'eur' }
      ] as any)
      await expect(generateUniqueRegionSlug(campaign, 'EUR')).resolves.toBe(
        'eur-2'
      )
      expect(prismaMock.campaignRegion.findMany).toHaveBeenCalledWith({
        where: { campaignId: 'campaignId', slug: { startsWith: 'eur' } },
        select: { slug: true }
      })
    })

    it('skips the slugs of the team’s live journeys', async () => {
      prismaMock.campaignRegion.findMany.mockResolvedValue([
        { slug: 'eur-2' }
      ] as any)
      prismaMock.journey.findMany.mockResolvedValue([{ slug: 'eur' }] as any)
      await expect(generateUniqueRegionSlug(campaign, 'EUR')).resolves.toBe(
        'eur-3'
      )
      expect(prismaMock.journey.findMany).toHaveBeenCalledWith({
        where: {
          teamId: 'teamId',
          slug: { startsWith: 'eur' },
          deletedAt: null
        },
        select: { slug: true }
      })
    })

    it('reserves the shared list plus the viewer segments and i18n locales', async () => {
      for (const reserved of [
        'admin',
        'embed',
        'legal',
        'plausible',
        'campaign',
        'template-gallery',
        'api',
        'fr',
        'zh-hans-cn'
      ]) {
        expect(REGION_RESERVED_SLUGS.has(reserved)).toBe(true)
      }
      await expectBadUserInputAsync(
        generateUniqueRegionSlug(campaign, 'Embed'),
        'slug'
      )
      await expectBadUserInputAsync(
        validateRegionSlug('campaignId', 'legal', 'regionId'),
        'slug'
      )
    })

    it('is author-editable with the same pattern, length and uniqueness within the campaign', async () => {
      await expect(
        validateRegionSlug('campaignId', ' Lac ', 'regionId')
      ).resolves.toBe('lac')
      expect(prismaMock.campaignRegion.findFirst).toHaveBeenCalledWith({
        where: {
          campaignId: 'campaignId',
          slug: 'lac',
          NOT: { id: 'regionId' }
        },
        select: { id: true }
      })
      await expectBadUserInputAsync(
        validateRegionSlug('campaignId', 'x'.repeat(201), 'regionId'),
        'slug'
      )
      prismaMock.campaignRegion.findFirst.mockResolvedValue({
        id: 'other'
      } as any)
      await expectBadUserInputAsync(
        validateRegionSlug('campaignId', 'lac', 'regionId'),
        'slug'
      )
    })
  })
})
