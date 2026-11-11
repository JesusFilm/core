import {
  TRANSLATED_FIELDS,
  type TranslatedBlockField,
  type TranslatedBlockTypename,
  isTranslated,
  translatedFieldsOf
} from '@core/journeys/ui/Campaign/libs/translatedField'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../__generated__/GetCampaign'
import { CampaignTextSource } from '../../../__generated__/globalTypes'

/**
 * The block typenames whose text is typed in place on the canvas: every
 * block with text but an image (its alt) and a carousel card (its title and
 * description), which are edited in their panels.
 */
type InlineTextTypename = Exclude<
  TranslatedBlockTypename,
  'CampaignImageBlock' | 'CampaignVideoBlock'
>

/** A block's text field under the name the editor reads it by (see `editorTextField`). */
type EditorTextField<T> = T extends TranslatedBlockTypename
  ? T extends 'CampaignRichTextBlock'
    ? Exclude<TranslatedBlockField<T>, 'content'> | 'richTextContent'
    : TranslatedBlockField<T>
  : never

/**
 * The name the editor reads a block's text field by. Rich text `content` is
 * read as `richTextContent` because the public fragment aliases it away from
 * the Typography block's `content`.
 */
export function editorTextField(typename: string, field: string): string {
  return typename === 'CampaignRichTextBlock' && field === 'content'
    ? 'richTextContent'
    : field
}

/**
 * Every Translated Field of a block typename as the editor's block holds it,
 * in render order; none for a typename without text.
 */
export function translatedBlockFields(typename: string): string[] {
  return Object.keys(translatedFieldsOf({ kind: 'block', typename })).map(
    (field) => editorTextField(typename, field)
  )
}

const PANEL_TEXT_TYPENAMES: readonly string[] = [
  'CampaignImageBlock',
  'CampaignVideoBlock'
] satisfies Array<Exclude<TranslatedBlockTypename, InlineTextTypename>>

/** The inline text fields each typename carries, in render order, from the Translated Field declaration. */
export const CAMPAIGN_TEXT_FIELDS = Object.fromEntries<readonly string[]>(
  Object.keys(TRANSLATED_FIELDS.block)
    .filter((typename) => !PANEL_TEXT_TYPENAMES.includes(typename))
    .map((typename) => [typename, translatedBlockFields(typename)])
) as {
  readonly [T in InlineTextTypename]: ReadonlyArray<EditorTextField<T>>
}

/** Every inline-editable default-language text column of a campaign block. */
export type CampaignTextField = EditorTextField<InlineTextTypename>

/** The API input key a block's text field is written under (see `editorTextField`). */
export function campaignTextInputKey(field: string): string {
  return field === 'richTextContent' ? 'content' : field
}

export type CampaignTextTypename = keyof typeof CAMPAIGN_TEXT_FIELDS

/** A block with at least one inline-editable text field. */
export type CampaignTextBlock = Extract<
  CampaignBlock,
  { __typename: CampaignTextTypename }
>

export function isCampaignTextBlock(
  block: CampaignBlock
): block is CampaignTextBlock {
  return block.__typename in CAMPAIGN_TEXT_FIELDS
}

/** The field the bar's Edit focuses first: the title where there is one. */
export function primaryTextField(
  typename: CampaignTextTypename
): CampaignTextField {
  const fields: readonly CampaignTextField[] = CAMPAIGN_TEXT_FIELDS[typename]
  return fields.includes('title') ? 'title' : fields[0]
}

export interface CampaignTranslatedValue {
  __typename: 'TranslatedValue'
  languageId: string
  value: string
  source: CampaignTextSource
}

/**
 * A block's column by a name only known at run time (a Translated Field, a
 * slot reference); undefined when the block has no such column.
 */
export function blockColumn(block: object, column: string): unknown {
  const value: unknown = Reflect.get(block, column)
  return value
}

/** A text field's default-language value on a block; null when unset or absent. */
export function textFieldValue(block: object, field: string): string | null {
  const value = blockColumn(block, field)
  return typeof value === 'string' ? value : null
}

function isTranslatedValueList(
  value: unknown
): value is CampaignTranslatedValue[] {
  return Array.isArray(value)
}

/** The `<field>Translations` list a block carries beside `field`. */
export function blockTranslations(
  block: object,
  field: string
): CampaignTranslatedValue[] {
  const list = blockColumn(block, `${field}Translations`)
  return isTranslatedValueList(list) ? list : []
}

/** The stored translation of a field in one language, or empty when it is not translated there. */
export function translationValue(
  translations: readonly CampaignTranslatedValue[],
  languageId: string
): string {
  const entry = translations.find(
    (translation) => translation.languageId === languageId
  )
  return isTranslated(entry) ? entry.value : ''
}

/**
 * The translations list after `campaignTranslationSet` writes `value` for
 * `languageId` as a human entry (or clears it when empty): the optimistic
 * shape of the mutation's result.
 */
export function withTranslationValue(
  translations: readonly CampaignTranslatedValue[],
  languageId: string,
  value: string
): CampaignTranslatedValue[] {
  const others = translations.filter(
    (translation) => translation.languageId !== languageId
  )
  const entry: CampaignTranslatedValue = {
    __typename: 'TranslatedValue',
    languageId,
    value,
    source: CampaignTextSource.human
  }
  return isTranslated(entry) ? [...others, entry] : others
}
