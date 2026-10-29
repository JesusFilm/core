import { CAMPAIGN_TYPENAMES } from '../campaignBlockGrammar'

import {
  LINK_URL_MAX_LENGTH,
  TEXT_CAPS,
  TRANSLATED_FIELDS,
  TRANSLATED_FIELD_NAMES,
  type TranslatedEntryLike,
  entrySource,
  isCampaignLanguage,
  isTranslated,
  isTranslating,
  isTranslationLanguage,
  isUncertain,
  parseTranslations,
  readTranslatedField,
  swapDefaultTexts,
  textLength,
  translatedFieldCap,
  translatedFieldsOf,
  truncate,
  urlLength,
  withHumanTranslation,
  withMachineTranslation
} from './translatedField'

const ENGLISH = '529'
const FRENCH = '496'
const SPANISH = '21028'

describe('translatedField', () => {
  describe('field declaration', () => {
    it('keeps the caps', () => {
      expect(TEXT_CAPS).toEqual({
        campaignTitle: 100,
        regionName: 60,
        eyebrow: 80,
        title: 150,
        description: 500,
        intro: 500,
        bullets: 1000,
        richTextContent: 5000,
        typographyContent: 2000,
        buttonLabel: 60,
        stringValue: 200,
        imageAlt: 500,
        videoTitle: 200,
        videoDescription: 1000,
        journeyTitle: 200,
        journeyDescription: 1000
      })
      expect(LINK_URL_MAX_LENGTH).toBe(2048)
    })

    it('enumerates every translatable field once', () => {
      expect([...TRANSLATED_FIELD_NAMES].sort()).toEqual(
        [
          'alt',
          'bullets',
          'content',
          'description',
          'eyebrow',
          'intro',
          'label',
          'name',
          'title',
          'value'
        ].sort()
      )
    })

    it('declares the fields and caps of every target', () => {
      expect(TRANSLATED_FIELDS).toEqual({
        block: {
          CampaignHeroBlock: { eyebrow: 80, title: 150, description: 500 },
          CampaignFeaturedMediaBlock: {
            eyebrow: 80,
            title: 150,
            description: 500,
            bullets: 1000
          },
          CampaignRichTextBlock: { title: 150, content: 5000 },
          CampaignRegionSwitcherBlock: { title: 150 },
          CampaignRegionHeaderBlock: { intro: 500 },
          CampaignRegionShareBlock: { title: 150, intro: 500 },
          CampaignJourneyListBlock: {
            eyebrow: 80,
            title: 150,
            description: 500
          },
          CampaignVideoCarouselBlock: {
            eyebrow: 80,
            title: 150,
            description: 500
          },
          CampaignAnalyticsBlock: { eyebrow: 80, title: 150 },
          CampaignTypographyBlock: { content: 2000 },
          CampaignButtonBlock: { label: 60 },
          CampaignImageBlock: { alt: 500 },
          CampaignVideoBlock: { title: 200, description: 1000 },
          CampaignJourneyBlock: { title: 200, description: 1000 }
        },
        region: { name: 60 },
        string: { value: 200 },
        campaign: { title: 100 }
      })
    })

    it('uses every field name, and only those, across the targets', () => {
      const used = new Set([
        ...Object.values(TRANSLATED_FIELDS.block).flatMap(Object.keys),
        ...Object.keys(TRANSLATED_FIELDS.region),
        ...Object.keys(TRANSLATED_FIELDS.string),
        ...Object.keys(TRANSLATED_FIELDS.campaign)
      ])
      expect([...used].sort()).toEqual([...TRANSLATED_FIELD_NAMES].sort())
    })

    it('keys blocks by Campaign Block typenames', () => {
      for (const typename of Object.keys(TRANSLATED_FIELDS.block))
        expect(CAMPAIGN_TYPENAMES).toContain(typename)
    })

    it.each([
      [{ kind: 'block', typename: 'CampaignHeroBlock' }, 'title', 150],
      [{ kind: 'block', typename: 'CampaignVideoBlock' }, 'title', 200],
      [{ kind: 'block', typename: 'CampaignHeroBlock' }, 'content', undefined],
      [{ kind: 'block', typename: 'CampaignColumnsBlock' }, 'title', undefined],
      [{ kind: 'region' }, 'name', 60],
      [{ kind: 'string' }, 'value', 200],
      [{ kind: 'campaign' }, 'title', 100],
      [{ kind: 'campaign' }, 'name', undefined]
    ] as const)('caps %j %s at %s', (target, field, cap) => {
      expect(translatedFieldCap(target, field)).toBe(cap)
    })

    it('reads no fields for a typename without text', () => {
      expect(
        translatedFieldsOf({ kind: 'block', typename: 'CampaignHeaderBlock' })
      ).toEqual({})
      expect(translatedFieldsOf({ kind: 'region' })).toBe(
        TRANSLATED_FIELDS.region
      )
    })
  })

  describe('counting', () => {
    it.each([
      ['plain', 'Hello', 5],
      ['surrounding spaces', '  Hello \n', 5],
      ['an astral character', '👋🏽 hi', 5],
      ['empty after trim', '   ', 0]
    ])('textLength counts code points after trim: %s', (_, value, length) => {
      expect(textLength(value)).toBe(length)
    })

    it.each([
      ['plain', 'https://a.co', 12],
      ['surrounding spaces', '  https://a.co  ', 12],
      ['an astral character', 'https://a.co/😀', 15]
    ])('urlLength counts UTF-16 units after trim: %s', (_, value, length) => {
      expect(urlLength(value)).toBe(length)
    })

    it.each([
      ['under the cap', 'abc', 5, 'abc'],
      ['over the cap', 'abcdef', 3, 'abc'],
      ['without splitting an astral character', '😀😀😀', 2, '😀😀'],
      ['without trimming', '  abc  ', 4, '  ab']
    ])('truncate cuts by code points %s', (_, value, max, expected) => {
      expect(truncate(value, max)).toBe(expected)
    })
  })

  describe('entry rules', () => {
    it.each<[string, TranslatedEntryLike, boolean, 'human' | 'machine']>([
      ['a human entry', { value: 'Bonjour', source: 'human' }, true, 'human'],
      [
        'a machine entry',
        { value: 'Bonjour', source: 'machine' },
        true,
        'machine'
      ],
      ['an empty entry', { value: '', source: 'machine' }, false, 'machine'],
      [
        'a non-string value',
        { value: 42, source: 'machine' },
        false,
        'machine'
      ],
      ['no value', { source: 'human' }, false, 'human'],
      [
        'an unknown source',
        { value: 'Bonjour', source: 'robot' },
        true,
        'human'
      ],
      ['no source', { value: 'Bonjour' }, true, 'human'],
      ['no entry', undefined, false, 'human'],
      ['a null entry', null, false, 'human']
    ])('%s', (_, entry, translated, source) => {
      expect(isTranslated(entry)).toBe(translated)
      expect(entrySource(entry)).toBe(source)
    })

    it('reads doubt only on a machine entry', () => {
      expect(
        isUncertain({ value: 'x', source: 'machine', uncertain: true })
      ).toBe(true)
      expect(isUncertain({ value: 'x', source: 'machine' })).toBe(false)
      expect(
        isUncertain({ value: 'x', source: 'human', uncertain: true })
      ).toBe(false)
      expect(
        isUncertain({ value: 'x', source: 'robot', uncertain: true })
      ).toBe(false)
    })

    it('parses a JSON column into a fresh object, and anything else as none', () => {
      const json = { [FRENCH]: { value: 'Bonjour', source: 'human' } }
      expect(parseTranslations(json)).toEqual(json)
      expect(parseTranslations(json)).not.toBe(json)
      for (const malformed of [null, undefined, 42, true, '{"496":', ['x']])
        expect(parseTranslations(malformed)).toEqual({})
    })
  })

  describe('isTranslating', () => {
    it.each([
      [FRENCH, ENGLISH, true],
      [ENGLISH, ENGLISH, false]
    ])('%s over default %s is %s', (preview, defaultLanguage, translating) => {
      expect(isTranslating(preview, defaultLanguage)).toBe(translating)
    })
  })

  describe('readTranslatedField', () => {
    it.each<
      [
        string,
        Parameters<typeof readTranslatedField>[0],
        ReturnType<typeof readTranslatedField>
      ]
    >([
      [
        'the column in the default language',
        {
          field: 'Hello',
          entry: { value: 'Shadow', source: 'machine' },
          translating: false
        },
        { value: 'Hello', fallback: 'Hello', translating: false }
      ],
      [
        'the translation when translating',
        {
          field: 'Hello',
          entry: { value: 'Bonjour', source: 'human' },
          translating: true
        },
        { value: 'Bonjour', fallback: 'Hello', translating: true }
      ],
      [
        'empty when translating without a translation',
        { field: 'Hello', entry: undefined, translating: true },
        { value: '', fallback: 'Hello', translating: true }
      ],
      [
        'empty when the translation is empty',
        { field: 'Hello', entry: { value: '' }, translating: true },
        { value: '', fallback: 'Hello', translating: true }
      ],
      [
        'empty when the translation is not a string',
        { field: 'Hello', entry: { value: ['x'] }, translating: true },
        { value: '', fallback: 'Hello', translating: true }
      ],
      [
        'an empty fallback for an unset column',
        { field: null, entry: undefined, translating: false },
        { value: '', fallback: '', translating: false }
      ]
    ])('reads %s', (_, input, read) => {
      expect(readTranslatedField(input)).toEqual(read)
    })
  })

  describe('withHumanTranslation', () => {
    it.each<[string, unknown, string, unknown]>([
      [
        'writes a human entry',
        null,
        'Bonjour',
        { [FRENCH]: { value: 'Bonjour', source: 'human' } }
      ],
      [
        'replaces a machine entry and its doubt',
        { [FRENCH]: { value: 'Salut', source: 'machine', uncertain: true } },
        'Bonjour',
        { [FRENCH]: { value: 'Bonjour', source: 'human' } }
      ],
      [
        'deletes the entry on an empty value',
        {
          [FRENCH]: { value: 'Bonjour', source: 'human' },
          [SPANISH]: { value: 'Hola', source: 'machine' }
        },
        '',
        { [SPANISH]: { value: 'Hola', source: 'machine' } }
      ],
      [
        'reads a malformed column as empty',
        [],
        'Bonjour',
        { [FRENCH]: { value: 'Bonjour', source: 'human' } }
      ]
    ])('%s', (_, json, value, expected) => {
      expect(withHumanTranslation(json, FRENCH, value)).toEqual(expected)
    })

    it('does not change the column it read', () => {
      const json = { [FRENCH]: { value: 'Salut', source: 'machine' } }
      withHumanTranslation(json, FRENCH, '')
      expect(json).toEqual({ [FRENCH]: { value: 'Salut', source: 'machine' } })
    })
  })

  describe('withMachineTranslation', () => {
    const sure = { value: 'Bonjour', uncertain: false }
    const written = { [FRENCH]: { value: 'Bonjour', source: 'machine' } }

    it.each<
      [string, TranslatedEntryLike, 'written' | 'kept', 'written' | 'kept']
    >([
      ['no entry', undefined, 'written', 'written'],
      ['an empty entry', { value: '', source: 'human' }, 'written', 'written'],
      [
        'a non-string human entry',
        { value: 42, source: 'human' },
        'written',
        'written'
      ],
      [
        'a machine entry',
        { value: 'Salut', source: 'machine' },
        'kept',
        'written'
      ],
      ['a human entry', { value: 'Salut', source: 'human' }, 'kept', 'kept'],
      [
        'an unknown-source entry',
        { value: 'Salut', source: 'robot' },
        'kept',
        'kept'
      ]
    ])('over %s: missing %s, all %s', (_, entry, missing, all) => {
      const json = entry === undefined ? {} : { [FRENCH]: entry }
      expect(withMachineTranslation(json, FRENCH, sure, 'missing')).toEqual(
        missing === 'written' ? written : null
      )
      expect(withMachineTranslation(json, FRENCH, sure, 'all')).toEqual(
        all === 'written' ? written : null
      )
    })

    it('flags a guess as uncertain', () => {
      expect(
        withMachineTranslation(
          null,
          FRENCH,
          { value: 'Bonjour', uncertain: true },
          'missing'
        )
      ).toEqual({
        [FRENCH]: { value: 'Bonjour', source: 'machine', uncertain: true }
      })
    })

    it('keeps other languages’ entries', () => {
      expect(
        withMachineTranslation(
          { [SPANISH]: { value: 'Hola', source: 'human' } },
          FRENCH,
          sure,
          'all'
        )
      ).toEqual({
        [SPANISH]: { value: 'Hola', source: 'human' },
        [FRENCH]: { value: 'Bonjour', source: 'machine' }
      })
    })
  })

  describe('swapDefaultTexts', () => {
    function swap(
      text: unknown,
      json: unknown
    ): ReturnType<typeof swapDefaultTexts> {
      return swapDefaultTexts({
        text,
        json,
        oldDefaultLanguageId: ENGLISH,
        newDefaultLanguageId: FRENCH
      })
    }

    it('promotes the new default’s translation and demotes the column as human', () => {
      expect(
        swap('Hello', {
          [FRENCH]: { value: 'Bonjour', source: 'machine', uncertain: true },
          [SPANISH]: { value: 'Hola', source: 'human' }
        })
      ).toEqual({
        text: 'Bonjour',
        json: {
          [ENGLISH]: { value: 'Hello', source: 'human' },
          [SPANISH]: { value: 'Hola', source: 'human' }
        }
      })
    })

    it('blanks the column when the new default has no translation', () => {
      expect(swap('Hello', {})).toEqual({
        text: '',
        json: { [ENGLISH]: { value: 'Hello', source: 'human' } }
      })
    })

    it('promotes into an empty column without demoting it', () => {
      expect(
        swap('  ', { [FRENCH]: { value: 'Bonjour', source: 'human' } })
      ).toEqual({ text: 'Bonjour', json: {} })
    })

    it.each([
      ['no entry', {}],
      ['an empty entry', { [FRENCH]: { value: '', source: 'machine' } }],
      ['a non-string entry', { [FRENCH]: { value: 42, source: 'human' } }]
    ])('leaves an empty column with %s unchanged', (_, json) => {
      expect(swap(null, json)).toBeNull()
    })

    it('never promotes a non-string entry', () => {
      expect(swap('Hello', { [FRENCH]: { value: 42 } })).toEqual({
        text: '',
        json: { [ENGLISH]: { value: 'Hello', source: 'human' } }
      })
    })
  })

  describe('language predicates', () => {
    const campaign = {
      defaultLanguageId: ENGLISH,
      languages: [{ languageId: ENGLISH }, { languageId: FRENCH }]
    }

    it.each([
      [ENGLISH, true, false],
      [FRENCH, true, true],
      [SPANISH, false, false]
    ])(
      '%s: a Campaign language %s, a translation language %s',
      (languageId, campaignLanguage, translationLanguage) => {
        expect(isCampaignLanguage(campaign, languageId)).toBe(campaignLanguage)
        expect(isTranslationLanguage(campaign, languageId)).toBe(
          translationLanguage
        )
      }
    )
  })
})
