import { useTranslation } from 'next-i18next/pages'
import { useEffect } from 'react'

import {
  TRANSLATED_FIELDS,
  textLength,
  translatedFieldCap
} from '@core/journeys/ui/Campaign/libs/translatedField'

import {
  GetCampaign_campaign_blocks_CampaignImageBlock as CampaignImageBlock,
  GetCampaign_campaign_regions as CampaignRegion,
  GetCampaign_campaign_strings as CampaignString,
  GetCampaign_campaign_blocks_CampaignVideoBlock as CampaignVideoBlock
} from '../../../../../__generated__/GetCampaign'
import { CampaignTextField as CampaignTextFieldEnum } from '../../../../../__generated__/globalTypes'
import {
  CampaignTextBlock,
  CampaignTextField,
  CampaignTranslatedValue,
  campaignTextInputKey,
  isCampaignTextBlock
} from '../../../../libs/useCampaignBlockTextMutation'
import { useCampaignBlockUpdateMutation } from '../../../../libs/useCampaignBlockUpdateMutation'
import { useCampaignRegionUpdateMutation } from '../../../../libs/useCampaignRegionUpdateMutation'
import { useCampaignStringUpdateMutation } from '../../../../libs/useCampaignStringUpdateMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { useCampaignBlockFieldsCommand } from '../useCampaignBlockFieldsCommand'
import { useCampaignTranslationCommand } from '../useCampaignTranslationCommand'
import { useCampaignTranslationWrite } from '../useCampaignTranslationWrite'
import { useCommittedField } from '../useCommittedField'

import { readPreviewField } from './readPreviewField'

/** A block field edited in a panel and committed on blur: an image's alt text, a carousel card's title or description. */
export type PanelBlockTarget =
  | { block: CampaignImageBlock; field: 'alt' }
  | { block: CampaignVideoBlock; field: 'title' | 'description' }

/**
 * A Translated Field the editor edits, named by the row it lives on as
 * `campaignTranslationSet`'s target input names it: a block's field, a
 * Campaign String or a region's name. A block's inline text is typed (each
 * write a plain save the text Command wraps); a panel field of a block is
 * committed on blur as a Command.
 */
export type TranslatedFieldTarget =
  | { block: CampaignTextBlock; field: CampaignTextField }
  | PanelBlockTarget
  | { string: CampaignString }
  | { region: CampaignRegion }

interface ResolvedField {
  /** The row the translation is cached on. */
  row: { __typename: string; id: string }
  target: { blockId: string } | { regionId: string } | { stringId: string }
  /** The field as the API names it. */
  apiField: CampaignTextFieldEnum
  defaultValue: string | null
  translations: CampaignTranslatedValue[]
  max: number
}

function resolveField(target: TranslatedFieldTarget): ResolvedField {
  if ('string' in target) {
    const { string } = target
    return {
      row: string,
      target: { stringId: string.id },
      apiField: CampaignTextFieldEnum.value,
      defaultValue: string.value,
      translations: string.valueTranslations,
      max: TRANSLATED_FIELDS.string.value
    }
  }
  if ('region' in target) {
    const { region } = target
    return {
      row: region,
      target: { regionId: region.id },
      apiField: CampaignTextFieldEnum.name,
      defaultValue: region.name,
      translations: region.nameTranslations,
      max: TRANSLATED_FIELDS.region.name
    }
  }
  const { block, field } = target
  const apiField = campaignTextInputKey(field) as CampaignTextFieldEnum
  const columns = block as unknown as Record<string, unknown>
  const list = columns[`${field}Translations`]
  const value = columns[field]
  return {
    row: block,
    target: { blockId: block.id },
    apiField,
    defaultValue: typeof value === 'string' ? value : null,
    translations: Array.isArray(list)
      ? (list as CampaignTranslatedValue[])
      : [],
    // Every field a target names is declared for its typename.
    max:
      translatedFieldCap(
        { kind: 'block', typename: block.__typename },
        apiField
      ) ?? 0
  }
}

function isPanelBlockTarget(
  target: TranslatedFieldTarget
): target is PanelBlockTarget {
  return 'block' in target && !isCampaignTextBlock(target.block)
}

export interface TranslatedFieldWrite {
  /** The field as stored in the Preview Language: its translation when translating (empty when there is none), else the default-language text. */
  value: string
  /** The default-language text, empty when unset. */
  fallback: string
  translating: boolean
  /** The field's cap, in `textLength`. */
  max: number
  /**
   * Write `next` in the Preview Language this render saw. Translating, it is
   * a human translation through `campaignTranslationSet`; in the default
   * language it goes through the field's own writer: the block's update or
   * `campaignStringUpdate` for typed text, `campaignRegionUpdate` for a
   * region's name, each a plain save that rejects when refused; a panel
   * field of a block is one Command (`addTranslation` or `addFields`) whose
   * refusal shows in `commandError` instead.
   */
  write: (
    next: string,
    context?: Record<string, unknown>
  ) => Promise<unknown> | undefined
  commandError?: string
  clearCommandErrors: () => void
}

/**
 * The read of a Translated Field in the Preview Language and the choice of
 * its writer: the one place that decides between a translation write and a
 * default-language write.
 */
export function useTranslatedFieldWrite(
  target: TranslatedFieldTarget
): TranslatedFieldWrite {
  const {
    campaign,
    state: { previewLanguageId }
  } = useCampaignEditor()
  const resolved = resolveField(target)
  const { value, fallback, translating } = readPreviewField({
    field: resolved.defaultValue,
    translations: resolved.translations,
    previewLanguageId,
    defaultLanguageId: campaign.defaultLanguageId
  })
  const writeTranslation = useCampaignTranslationWrite()
  const translationCommand = useCampaignTranslationCommand()
  const fieldsCommand = useCampaignBlockFieldsCommand()
  const { update } = useCampaignBlockUpdateMutation()
  const [stringUpdate] = useCampaignStringUpdateMutation()
  const [regionUpdate] = useCampaignRegionUpdateMutation()

  function write(
    next: string,
    context?: Record<string, unknown>
  ): Promise<unknown> | undefined {
    if (isPanelBlockTarget(target)) {
      if (translating) {
        translationCommand.addTranslation({
          block: target.block,
          field: resolved.apiField,
          languageId: previewLanguageId,
          value: next,
          previous: value
        })
        return undefined
      }
      const column = next === '' ? null : next
      if (target.field === 'alt')
        fieldsCommand.addFields(target.block, { alt: column })
      else fieldsCommand.addFields(target.block, { [target.field]: column })
      return undefined
    }
    if (translating)
      return writeTranslation({
        campaignId: campaign.id,
        row: resolved.row,
        target: resolved.target,
        field: resolved.apiField,
        languageId: previewLanguageId,
        value: next,
        translations: resolved.translations,
        context
      })
    if ('region' in target) {
      const { region } = target
      return regionUpdate({
        variables: { id: region.id, input: { name: next } },
        optimisticResponse: {
          campaignRegionUpdate: {
            __typename: 'CampaignRegion',
            id: region.id,
            name: next,
            slug: region.slug,
            listed: region.listed
          }
        },
        context
      })
    }
    if ('string' in target) {
      const { string } = target
      return stringUpdate({
        variables: { campaignId: campaign.id, key: string.key, value: next },
        optimisticResponse: {
          campaignStringUpdate: {
            __typename: 'CampaignString',
            id: string.id,
            key: string.key,
            value: next
          }
        },
        context
      })
    }
    return update(target.block, { [resolved.apiField]: next }, { context })
  }

  function clearCommandErrors(): void {
    translationCommand.clearError()
    fieldsCommand.clearError()
  }

  return {
    value,
    fallback,
    translating,
    max: resolved.max,
    write,
    commandError: translationCommand.error ?? fieldsCommand.error,
    clearCommandErrors
  }
}

export interface TranslatedFieldOptions {
  /** A pre-check before the cap's, given whether the edit is a translation. */
  validate?: (value: string, translating: boolean) => string | undefined
  /** The message for a value over the cap; "Max {{max}} characters" by default. */
  tooLongMessage?: (max: number) => string
}

export interface TranslatedField {
  /** What the field shows: the draft while typing, else the value stored in the Preview Language. */
  value: string
  /** The default-language text, empty when unset: a translating field's placeholder. */
  fallback: string
  translating: boolean
  /** The field's cap, in `textLength`. */
  max: number
  onChange: (next: string) => void
  /** Commit the draft in the Preview Language (see `useCommittedField`). */
  onBlur: () => void
  /** The pre-check's message, or the API's message verbatim when the write was refused. */
  error?: string
}

/**
 * A Translated Field edited in a campaign panel and committed on blur, in
 * the Preview Language: read through `readTranslatedField`, pre-checked
 * against its cap, and written through the writer `useTranslatedFieldWrite`
 * picks, so what can be undone does not change (a block's field is a
 * Command, a region's name a plain save). Changing the Preview Language
 * drops an uncommitted draft and the error.
 */
export function useTranslatedField(
  target: TranslatedFieldTarget,
  { validate, tooLongMessage }: TranslatedFieldOptions = {}
): TranslatedField {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { previewLanguageId }
  } = useCampaignEditor()
  const field = useTranslatedFieldWrite(target)
  const { clearCommandErrors } = field
  const committedField = useCommittedField({
    committed: field.value,
    validate: (value) =>
      validate?.(value, field.translating) ??
      (textLength(value) > field.max
        ? (tooLongMessage?.(field.max) ??
          t('Max {{max}} characters', { max: field.max }))
        : undefined),
    save: (value) => field.write(value),
    resetKey: previewLanguageId
  })

  useEffect(() => {
    clearCommandErrors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewLanguageId])

  return {
    value: committedField.value,
    fallback: field.fallback,
    translating: field.translating,
    max: field.max,
    onChange: committedField.onChange,
    onBlur: committedField.onBlur,
    error: committedField.error ?? field.commandError
  }
}
