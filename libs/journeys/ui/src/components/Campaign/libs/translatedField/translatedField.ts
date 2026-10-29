/**
 * The rules of a Translated Field: which fields each target carries and
 * their caps, how a length is counted, when a language counts as
 * translated, how an entry is written, and what the field shows in a
 * language. The one copy the API and the editor read. Pure: it imports no
 * generated types, React, Apollo or Prisma, so the API can import it.
 */

import type { CampaignTypename } from '../campaignBlockGrammar'

/** The cap of every text column, in Unicode code points after trimming. */
export const TEXT_CAPS = {
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
} as const

/** The cap of a link URL, in UTF-16 code units after trimming (`urlLength`). */
export const LINK_URL_MAX_LENGTH = 2048

/** Every translatable field name across the targets: the values of the `CampaignTextField` enum. */
export const TRANSLATED_FIELD_NAMES = [
  'eyebrow',
  'title',
  'bullets',
  'content',
  'intro',
  'label',
  'alt',
  'description',
  'name',
  'value'
] as const
export type TranslatedFieldName = (typeof TRANSLATED_FIELD_NAMES)[number]

/** A target's translatable fields, each with its cap. */
export type TranslatedFieldCaps = Partial<Record<TranslatedFieldName, number>>

/** The four rows a Translated Field lives on. */
export type TranslatedFieldTargetKind =
  | 'block'
  | 'region'
  | 'string'
  | 'campaign'

const SECTION_HEADING = {
  eyebrow: TEXT_CAPS.eyebrow,
  title: TEXT_CAPS.title
} as const

/**
 * The field declaration of every target: a block's follow its typename (a
 * typename with no text is absent), a region carries its `name`, a Campaign
 * String its `value` and the Campaign its `title`. A field's cap depends on
 * the target (`title` is 100 on the Campaign, 150 on a section, 200 on a
 * video or journey card).
 */
export const TRANSLATED_FIELDS = {
  block: {
    CampaignHeroBlock: {
      ...SECTION_HEADING,
      description: TEXT_CAPS.description
    },
    CampaignFeaturedMediaBlock: {
      ...SECTION_HEADING,
      description: TEXT_CAPS.description,
      bullets: TEXT_CAPS.bullets
    },
    CampaignRichTextBlock: {
      title: TEXT_CAPS.title,
      content: TEXT_CAPS.richTextContent
    },
    CampaignRegionSwitcherBlock: { title: TEXT_CAPS.title },
    CampaignRegionHeaderBlock: { intro: TEXT_CAPS.intro },
    CampaignRegionShareBlock: {
      title: TEXT_CAPS.title,
      intro: TEXT_CAPS.intro
    },
    CampaignJourneyListBlock: {
      ...SECTION_HEADING,
      description: TEXT_CAPS.description
    },
    CampaignVideoCarouselBlock: {
      ...SECTION_HEADING,
      description: TEXT_CAPS.description
    },
    CampaignAnalyticsBlock: SECTION_HEADING,
    CampaignTypographyBlock: { content: TEXT_CAPS.typographyContent },
    CampaignButtonBlock: { label: TEXT_CAPS.buttonLabel },
    CampaignImageBlock: { alt: TEXT_CAPS.imageAlt },
    CampaignVideoBlock: {
      title: TEXT_CAPS.videoTitle,
      description: TEXT_CAPS.videoDescription
    },
    CampaignJourneyBlock: {
      title: TEXT_CAPS.journeyTitle,
      description: TEXT_CAPS.journeyDescription
    }
  },
  region: { name: TEXT_CAPS.regionName },
  string: { value: TEXT_CAPS.stringValue },
  campaign: { title: TEXT_CAPS.campaignTitle }
} as const satisfies {
  block: Partial<Record<CampaignTypename, TranslatedFieldCaps>>
} & Record<Exclude<TranslatedFieldTargetKind, 'block'>, TranslatedFieldCaps>

/** A block typename that carries text. */
export type TranslatedBlockTypename = keyof (typeof TRANSLATED_FIELDS)['block']

/** The text fields a block typename carries. */
export type TranslatedBlockField<T extends TranslatedBlockTypename> =
  keyof (typeof TRANSLATED_FIELDS)['block'][T] & TranslatedFieldName

/** Which target a field declaration is read for: a block by its typename. */
export type TranslatedFieldTarget =
  | { kind: 'block'; typename: string }
  | { kind: Exclude<TranslatedFieldTargetKind, 'block'> }

/** The translatable fields of `target` and their caps; none for a typename without text. */
export function translatedFieldsOf(
  target: TranslatedFieldTarget
): TranslatedFieldCaps {
  if (target.kind !== 'block') return TRANSLATED_FIELDS[target.kind]
  const blockFields: Partial<Record<string, TranslatedFieldCaps>> =
    TRANSLATED_FIELDS.block
  return blockFields[target.typename] ?? {}
}

/** The cap of `field` on `target`; undefined when the target does not carry it. */
export function translatedFieldCap(
  target: TranslatedFieldTarget,
  field: string
): number | undefined {
  return (translatedFieldsOf(target) as Partial<Record<string, number>>)[field]
}

/** A text's length: Unicode code points after trimming, so an emoji counts once. */
export function textLength(value: string): number {
  return [...value.trim()].length
}

/** A link URL's length: UTF-16 code units (`.length`) after trimming. */
export function urlLength(value: string): number {
  return value.trim().length
}

/**
 * Cut to at most `max` Unicode code points, without trimming: for text
 * copied in from a source (YouTube, Mux, a linked journey) so a later save
 * of it passes the cap.
 */
export function truncate(value: string, max: number): string {
  const characters = [...value]
  return characters.length <= max ? value : characters.slice(0, max).join('')
}

export type TranslatedFieldSource = 'human' | 'machine'

/** One stored translation: `uncertain` only on a machine entry the model flagged as a guess. */
export interface TranslatedFieldEntry {
  value: string
  source: TranslatedFieldSource
  uncertain?: boolean
}

/**
 * The stored shape of every `<field>Translations` JSON column, keyed by
 * language id. Entries are read as stored, so a reader checks the entry it
 * uses through the entry rules below.
 */
export type TranslatedFieldJson = Record<string, TranslatedFieldEntry>

/** One entry as either side holds it: a JSON map value or a GraphQL list item, possibly malformed. */
export type TranslatedEntryLike =
  | { value?: unknown; source?: unknown; uncertain?: unknown }
  | null
  | undefined

/**
 * Read a `<field>Translations` JSON column as a fresh object the caller may
 * change. Anything but a JSON object (null, an array, a string, a number)
 * reads as no translations.
 */
export function parseTranslations(json: unknown): TranslatedFieldJson {
  if (json == null || typeof json !== 'object' || Array.isArray(json)) return {}
  return { ...(json as TranslatedFieldJson) }
}

/** Whether a language has a translation: the entry's value is a non-empty string. An empty or non-string value counts as missing. */
export function isTranslated(
  entry: TranslatedEntryLike
): entry is { value: string; source?: unknown; uncertain?: unknown } {
  return entry != null && typeof entry.value === 'string' && entry.value !== ''
}

/** Who wrote an entry: `machine` only when it says exactly so, else a person, so the machine never overwrites it. */
export function entrySource(entry: TranslatedEntryLike): TranslatedFieldSource {
  return entry?.source === 'machine' ? 'machine' : 'human'
}

/** Whether an entry is a machine guess a person should check. */
export function isUncertain(entry: TranslatedEntryLike): boolean {
  return entrySource(entry) === 'machine' && entry?.uncertain === true
}

/** Whether the editor is translating: the Preview Language is not the default. */
export function isTranslating(
  previewLanguageId: string,
  defaultLanguageId: string
): boolean {
  return previewLanguageId !== defaultLanguageId
}

export interface TranslatedFieldRead {
  /** What the field shows: the column in the default language, the translation when translating, `''` when translating without one. */
  value: string
  /** The default-language column, `''` when unset. */
  fallback: string
  translating: boolean
}

/**
 * The read of a Translated Field in one language: `field` is the
 * default-language column, `entry` the language's entry and `translating`
 * whether that language is not the default. The default language's value is
 * the column, so an entry stored under the default is ignored.
 */
export function readTranslatedField({
  field,
  entry,
  translating
}: {
  field: string | null | undefined
  entry: TranslatedEntryLike
  translating: boolean
}): TranslatedFieldRead {
  const fallback = field ?? ''
  if (!translating) return { value: fallback, fallback, translating }
  return {
    value: isTranslated(entry) ? entry.value : '',
    fallback,
    translating
  }
}

/**
 * The next JSON after a person writes `value` in `languageId`: a human entry,
 * which drops any machine doubt, or the entry removed when `value` is empty.
 */
export function withHumanTranslation(
  json: unknown,
  languageId: string,
  value: string
): TranslatedFieldJson {
  const next = parseTranslations(json)
  if (value === '') {
    delete next[languageId]
    return next
  }
  next[languageId] = { value, source: 'human' }
  return next
}

/** How a machine run treats an existing translation: `missing` fills only missing ones, `all` also replaces the machine's. */
export type MachineTranslateMode = 'missing' | 'all'

/**
 * The next JSON after the machine translates into `languageId`, or null when
 * the existing entry stays: a person's entry (any translated entry not
 * exactly `machine`) is never replaced, and `missing` keeps every translated
 * entry. `uncertain` is set only on a line the model flagged as a guess.
 */
export function withMachineTranslation(
  json: unknown,
  languageId: string,
  machine: { value: string; uncertain: boolean },
  mode: MachineTranslateMode
): TranslatedFieldJson | null {
  const next = parseTranslations(json)
  const existing = next[languageId]
  if (
    isTranslated(existing) &&
    (mode === 'missing' || entrySource(existing) === 'human')
  )
    return null
  next[languageId] = {
    value: machine.value,
    source: 'machine',
    ...(machine.uncertain ? { uncertain: true } : {})
  }
  return next
}

/**
 * One field after the default language moves from `oldDefaultLanguageId` to
 * `newDefaultLanguageId`, or null when it has nothing to move: the column
 * text becomes a human entry under the old default, and the new default's
 * translation becomes the column, its entry dropped. Empty text is not
 * moved, and a missing translation (empty or not a string) is not promoted,
 * so a field with neither stays as it is.
 */
export function swapDefaultTexts({
  text,
  json,
  oldDefaultLanguageId,
  newDefaultLanguageId
}: {
  text: unknown
  json: unknown
  oldDefaultLanguageId: string
  newDefaultLanguageId: string
}): { text: string; json: TranslatedFieldJson } | null {
  const currentText = typeof text === 'string' ? text : ''
  const next = parseTranslations(json)
  const entry = next[newDefaultLanguageId]
  const promoted = isTranslated(entry) ? entry.value : ''
  if (currentText.trim() === '' && promoted === '') return null

  delete next[newDefaultLanguageId]
  if (currentText.trim() !== '')
    next[oldDefaultLanguageId] = { value: currentText, source: 'human' }
  return { text: promoted, json: next }
}

/** The languages of a Campaign, as both the API's rows and the editor's query carry them. */
export interface CampaignLanguages {
  defaultLanguageId: string
  languages: ReadonlyArray<{ languageId: string }>
}

/** Whether `languageId` is one of the Campaign's languages. */
export function isCampaignLanguage(
  campaign: CampaignLanguages,
  languageId: string
): boolean {
  return campaign.languages.some(
    (language) => language.languageId === languageId
  )
}

/** Whether `languageId` takes translations: a Campaign language other than the default. */
export function isTranslationLanguage(
  campaign: CampaignLanguages,
  languageId: string
): boolean {
  return (
    languageId !== campaign.defaultLanguageId &&
    isCampaignLanguage(campaign, languageId)
  )
}
