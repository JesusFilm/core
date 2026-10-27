import { useCallback, useRef, useState } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import {
  CampaignPageKind,
  CampaignTextField
} from '../../../../../__generated__/globalTypes'
import { CampaignTranslatedValue } from '../../../../libs/useCampaignBlockTextMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { messageOf } from '../messageOf'
import { useCampaignTranslationWrite } from '../useCampaignTranslationWrite'

interface TranslationParameters {
  value: string
  pageKind: CampaignPageKind
  focus: boolean
}

export interface AddTranslationOptions {
  block: CampaignBlock
  field: CampaignTextField
  /** The campaign language being previewed; never the default. */
  languageId: string
  value: string
  /** The translation as the block holds it now: what undo writes back. */
  previous: string
}

export interface CampaignTranslationCommand {
  addTranslation: (options: AddTranslationOptions) => void
  /** The API's message, verbatim, when the last translation save failed. */
  error?: string
  clearError: () => void
}

/**
 * A translation of a block field that is committed in one go (an image's
 * alt, a carousel card's title or description) is one Command: execute
 * writes it through `campaignTranslationSet`; undo writes the translation
 * the block had back, after focusing the page, block and preview language
 * the edit was made in; redo writes it again. The row is read from the cache
 * when the Command runs, so an undo never resurrects translations changed
 * since.
 */
export function useCampaignTranslationCommand(): CampaignTranslationCommand {
  const { add } = useCommand()
  const {
    campaign,
    state: { pageKind },
    dispatch,
    pageKindOf
  } = useCampaignEditor()
  const writeTranslation = useCampaignTranslationWrite()
  const blocksRef = useRef(campaign.blocks)
  blocksRef.current = campaign.blocks
  const [error, setError] = useState<string>()
  const clearError = useCallback(() => setError(undefined), [])

  function addTranslation({
    block,
    field,
    languageId,
    value,
    previous
  }: AddTranslationOptions): void {
    setError(undefined)
    const blockPageKind = pageKindOf(block) ?? pageKind
    add<TranslationParameters>({
      parameters: {
        execute: { value, pageKind: blockPageKind, focus: false },
        undo: { value: previous, pageKind: blockPageKind, focus: true },
        redo: { value, pageKind: blockPageKind, focus: true }
      },
      execute({ value: nextValue, pageKind: targetPageKind, focus }) {
        if (focus) {
          dispatch({
            type: 'SetEditorFocusAction',
            pageKind: targetPageKind,
            selectedBlockId: block.id
          })
          dispatch({
            type: 'SetPreviewLanguageAction',
            previewLanguageId: languageId
          })
        }
        const current =
          blocksRef.current.find((candidate) => candidate.id === block.id) ??
          block
        const list = (current as unknown as Record<string, unknown>)[
          `${field}Translations`
        ]
        void writeTranslation({
          campaignId: campaign.id,
          row: current,
          target: { blockId: block.id },
          field,
          languageId,
          value: nextValue,
          translations: Array.isArray(list)
            ? (list as CampaignTranslatedValue[])
            : []
        }).catch((mutationError: unknown) => {
          setError(messageOf(mutationError))
        })
      }
    })
  }

  return { addTranslation, error, clearError }
}
