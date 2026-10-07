import { CombinedGraphQLErrors } from '@apollo/client'
import { useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useCommand } from '@core/journeys/ui/CommandProvider'

import { GetCampaign_campaign_strings as CampaignString } from '../../../../../__generated__/GetCampaign'
import {
  CampaignPageKind,
  CampaignTextField as CampaignTextFieldEnum
} from '../../../../../__generated__/globalTypes'
import {
  CampaignTextBlock,
  CampaignTextField,
  CampaignTranslatedValue,
  blockTranslations,
  translationValue,
  useCampaignBlockTextMutation,
  withTranslationValue
} from '../../../../libs/useCampaignBlockTextMutation'
import { useCampaignStringUpdateMutation } from '../../../../libs/useCampaignStringUpdateMutation'
import { useCampaignTranslationSetMutation } from '../../../../libs/useCampaignTranslationSetMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'

/** One inline-editable text: a text field of a campaign block, or a Campaign String. */
export type CampaignTextTarget =
  | { block: CampaignTextBlock; field: CampaignTextField; string?: undefined }
  | { string: CampaignString; block?: undefined; field?: undefined }

export interface CampaignTextCommand {
  /** The text as typed; follows the cache when a save or an undo changes it. */
  value: string
  /**
   * While previewing a non-default language: the default-language text the
   * public page falls back to when the translation is empty. Empty otherwise.
   */
  fallback: string
  /** The API's message, verbatim, when the last save failed. */
  error?: string
  handleChange: (next: string) => void
  handleFocus: () => void
  handleBlur: () => void
}

interface TextCommandParameters {
  value: string
  /** The campaign language the edit was made in; null for the default language. */
  languageId: string | null
  context: Record<string, unknown>
  pageKind: CampaignPageKind | undefined
  focus: boolean
}

/**
 * The debounce key that groups one field's keystrokes into one request; a
 * translation edit is keyed by its language too.
 */
export function textDebounceKey(
  target: { __typename: string; id: string },
  field: string,
  languageId?: string | null
): string {
  const base = `${textDebounceKeyPrefix(target)}${field}`
  return languageId == null ? base : `${base}:${languageId}`
}

/** The prefix shared by the debounce keys of every field of one block. */
export function textDebounceKeyPrefix(target: {
  __typename: string
  id: string
}): string {
  return `${target.__typename}:${target.id}:`
}

function messageOf(error: unknown): string {
  if (CombinedGraphQLErrors.is(error) && error.errors[0] != null)
    return error.errors[0].message
  return error instanceof Error ? error.message : String(error)
}

interface ResolvedTarget {
  __typename: string
  id: string
  field: CampaignTextField | 'value'
  defaultValue: string
  translations: CampaignTranslatedValue[]
  translationTarget: { blockId: string } | { stringId: string }
}

function resolveTarget(target: CampaignTextTarget): ResolvedTarget {
  if (target.string != null) {
    const { string } = target
    return {
      __typename: 'CampaignString',
      id: string.id,
      field: 'value',
      defaultValue: string.value,
      translations: string.valueTranslations,
      translationTarget: { stringId: string.id }
    }
  }
  const { block, field } = target
  return {
    __typename: block.__typename,
    id: block.id,
    field,
    defaultValue:
      (block as unknown as Record<string, string | null>)[field] ?? '',
    translations: blockTranslations(block, field),
    translationTarget: { blockId: block.id }
  }
}

/**
 * Typing into one text is one Command: every change while the field is
 * focused carries the same stable id, so CommandProvider keeps only the
 * latest, and the id resets on blur or undo. In the default language a block
 * field writes through the block's typed update mutation and a Campaign
 * String through `campaignStringUpdate`; while previewing another campaign
 * language every edit writes a human translation for that language through
 * `campaignTranslationSet`. Each write is debounced by the Apollo link under
 * one key per field (and language) and shown optimistically; undo writes the
 * value the field had when it took focus back through the same mutation,
 * after focusing the page, block and preview language the edit was made in.
 */
export function useCampaignTextCommand(
  target: CampaignTextTarget
): CampaignTextCommand {
  const {
    campaign,
    state: { pageKind, previewLanguageId },
    dispatch,
    pageKindOf
  } = useCampaignEditor()
  const resolved = resolveTarget(target)
  const translating = previewLanguageId !== campaign.defaultLanguageId
  const committed = translating
    ? translationValue(resolved.translations, previewLanguageId)
    : resolved.defaultValue
  const [value, setValue] = useState(committed)
  const [error, setError] = useState<string>()
  const [commandInput, setCommandInput] = useState(() => ({
    id: uuidv4(),
    value: committed
  }))
  const {
    add,
    state: { undo }
  } = useCommand()
  const mutateBlock = useCampaignBlockTextMutation()
  const [stringUpdate] = useCampaignStringUpdateMutation()
  const [translationSet] = useCampaignTranslationSetMutation()

  // The value an undo or redo of this field just wrote: the cache has not
  // caught up when the effect below runs, so it is the field's new baseline.
  const appliedValue = useRef<string | undefined>(undefined)

  useEffect(() => {
    const applied = appliedValue.current
    appliedValue.current = undefined
    if (undo == null || undo.id === commandInput.id) return
    setCommandInput({ id: uuidv4(), value: applied ?? committed })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undo?.id])

  useEffect(() => {
    // The API trims what it stores, so a save that only trimmed what was
    // typed must not rewrite the field while the user is still typing.
    setValue((typed) => (typed.trim() === committed ? typed : committed))
  }, [committed])

  useEffect(() => {
    setCommandInput({ id: uuidv4(), value: committed })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewLanguageId])

  function resetCommandInput(): void {
    setCommandInput({ id: uuidv4(), value })
  }

  async function write(
    nextValue: string,
    languageId: string | null,
    context: Record<string, unknown>
  ): Promise<unknown> {
    const requestContext = {
      debounceKey: textDebounceKey(resolved, resolved.field, languageId),
      ...context
    }
    if (languageId != null) {
      const column = `${resolved.field}Translations`
      return await translationSet({
        variables: {
          input: {
            target: resolved.translationTarget,
            field:
              CampaignTextFieldEnum[
                resolved.field as keyof typeof CampaignTextFieldEnum
              ],
            languageId,
            value: nextValue
          }
        },
        optimisticResponse: {
          campaignTranslationSet: withTranslationValue(
            resolved.translations,
            languageId,
            nextValue
          )
        },
        context: requestContext,
        update(cache, { data }) {
          if (data == null) return
          cache.modify({
            id: cache.identify({
              __typename: resolved.__typename,
              id: resolved.id
            }),
            fields: { [column]: () => data.campaignTranslationSet }
          })
        }
      })
    }
    if (target.string != null) {
      const { string } = target
      return await stringUpdate({
        variables: {
          campaignId: campaign.id,
          key: string.key,
          value: nextValue
        },
        optimisticResponse: {
          campaignStringUpdate: {
            __typename: 'CampaignString',
            id: string.id,
            key: string.key,
            value: nextValue
          }
        },
        context: requestContext
      })
    }
    return await mutateBlock(
      target.block,
      target.field,
      nextValue,
      requestContext
    )
  }

  function handleChange(next: string): void {
    setValue(next)
    setError(undefined)
    const block = target.block
    const blockPageKind =
      block == null ? undefined : (pageKindOf(block) ?? pageKind)
    const languageId = translating ? previewLanguageId : null
    add<TextCommandParameters>({
      id: commandInput.id,
      parameters: {
        execute: {
          value: next,
          languageId,
          context: {},
          pageKind: blockPageKind,
          focus: false
        },
        undo: {
          value: commandInput.value,
          languageId,
          context: { debounceTimeout: 1 },
          pageKind: blockPageKind,
          focus: true
        },
        redo: {
          value: next,
          languageId,
          context: { debounceTimeout: 1 },
          pageKind: blockPageKind,
          focus: true
        }
      },
      execute({
        value: nextValue,
        languageId: targetLanguageId,
        context,
        pageKind: targetPageKind,
        focus
      }) {
        if (focus) {
          appliedValue.current = nextValue
          if (block != null)
            dispatch({
              type: 'SetEditorFocusAction',
              pageKind: targetPageKind,
              selectedBlockId: block.id
            })
          dispatch({
            type: 'SetPreviewLanguageAction',
            previewLanguageId: targetLanguageId ?? campaign.defaultLanguageId
          })
        }
        void write(nextValue, targetLanguageId, context).catch(
          (mutationError: unknown) => {
            setError(messageOf(mutationError))
          }
        )
      }
    })
  }

  return {
    value,
    fallback: translating ? resolved.defaultValue : '',
    error,
    handleChange,
    handleFocus: resetCommandInput,
    handleBlur: resetCommandInput
  }
}
