import { v4 as uuidv4 } from 'uuid'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import { CampaignChildPlacement } from '../../../../../__generated__/globalTypes'
import { campaignBlockInsertUpdate } from '../../../../libs/campaignBlockCache'
import { useCampaignBlockOrderUpdateMutation } from '../../../../libs/useCampaignBlockOrderUpdateMutation'
import { useCampaignButtonBlockCreateMutation } from '../../../../libs/useCampaignButtonBlockCreateMutation'
import { CampaignSectionTypename } from '../../../../libs/useCampaignSectionCreateMutation'
import { useCampaignTypographyBlockCreateMutation } from '../../../../libs/useCampaignTypographyBlockCreateMutation'
import { regionLines, useCampaignEditor } from '../../CampaignEditorProvider'
import { reorderedSiblings } from '../reorderedSiblings'
import { useCampaignBlockCreateCommand } from '../useCampaignBlockCreateCommand'
import { useCampaignSectionAdd } from '../useCampaignSectionAdd'
import { useCommandFailure } from '../useCommandFailure'

import { AddTargets, ExtraTypename, addTargets } from './addTargets'

/** The label a new button Extra is born with (PRD §14); campaign content, not UI copy. */
export const NEW_BUTTON_LABEL = 'Button'

interface CampaignAddCommand {
  /** What the selection can be added to; see `addTargets`. */
  targets: AddTargets
  addSection: (typename: CampaignSectionTypename) => void
  addExtra: (
    typename: ExtraTypename,
    placement?: CampaignChildPlacement
  ) => void
  addLine: () => void
}

/**
 * The editor's add handlers: a section, an Extra or a Region Line, placed by
 * the insertion rule of `addTargets` for the current selection. Each add is
 * the same create Command a menu used to dispatch. Shared by the Add Panel
 * and the canvas "+", whose preset insert point it follows.
 *
 * An Extra added after a selected Extra is still one Command: the create
 * lands it last (the API has no position on create), so it shows at once
 * right after the selected Extra with the later siblings shifted, and once
 * the create lands the order mutation moves it there on the server. Undo
 * and redo are the create Command's soft delete and restore.
 */
export function useCampaignAddCommand(): CampaignAddCommand {
  const {
    campaign,
    selection,
    state: { pageKind, addPreset }
  } = useCampaignEditor()
  const { addBlock } = useCampaignBlockCreateCommand()
  const addSectionAt = useCampaignSectionAdd()
  const [typographyCreate] = useCampaignTypographyBlockCreateMutation(
    campaign.id
  )
  const [buttonCreate] = useCampaignButtonBlockCreateMutation(campaign.id)
  const [orderUpdate] = useCampaignBlockOrderUpdateMutation()
  const reportFailure = useCommandFailure()
  const targets = addTargets({
    selection,
    campaign,
    pageKind,
    preset: addPreset
  })

  function addSection(typename: CampaignSectionTypename): void {
    if (targets.section == null) return
    addSectionAt(typename, targets.section.insert)
  }

  function addExtra(
    typename: ExtraTypename,
    chosenPlacement?: CampaignChildPlacement
  ): void {
    if (targets.extra == null) return
    const { host, inheritsPlacement, after } = targets.extra
    const placement =
      inheritsPlacement || chosenPlacement == null
        ? targets.extra.placement
        : chosenPlacement
    const id = uuidv4()
    const siblings = campaign.blocks.filter(
      (candidate) =>
        candidate.parentBlockId === host.id && candidate.parentOrder != null
    )
    const parentOrder =
      after?.parentOrder != null ? after.parentOrder + 1 : siblings.length
    const base = {
      id,
      campaignId: campaign.id,
      pageId: host.pageId,
      regionId: host.regionId,
      parentBlockId: host.id,
      parentOrder,
      placement
    }
    const input = {
      id,
      campaignId: campaign.id,
      parentBlockId: host.id,
      placement
    }

    /** Moves the landed block (last among its siblings) right after `after`. */
    async function moveAfter(block: CampaignBlock): Promise<void> {
      if (after == null) return
      const rows = reorderedSiblings(
        [...campaign.blocks, block],
        block,
        parentOrder
      )
      // The block exists either way: a refused move leaves it last, and only
      // the move is reported.
      await orderUpdate({
        variables: { id: block.id, parentOrder },
        optimisticResponse: { campaignBlockOrderUpdate: rows }
      }).catch((error: unknown) => reportFailure(error))
    }

    if (typename === 'CampaignTypographyBlock') {
      const block: CampaignBlock = {
        __typename: 'CampaignTypographyBlock',
        ...base,
        content: '',
        contentTranslations: [],
        typographyVariant: null,
        align: null,
        color: null
      }
      addBlock({
        block,
        async execute() {
          const result = await typographyCreate({
            variables: { input },
            optimisticResponse: { campaignTypographyBlockCreate: block },
            // After an Extra: shown at its position at once, the later
            // siblings shifted.
            ...(after != null
              ? {
                  update: (cache, { data }) =>
                    campaignBlockInsertUpdate(
                      cache,
                      campaign.id,
                      data?.campaignTypographyBlockCreate
                    )
                }
              : {})
          })
          await moveAfter(block)
          return result
        }
      })
      return
    }
    const block: CampaignBlock = {
      __typename: 'CampaignButtonBlock',
      ...base,
      label: NEW_BUTTON_LABEL,
      labelTranslations: [],
      buttonVariant: null,
      size: null,
      align: null,
      color: null,
      labelColor: null,
      action: null
    }
    addBlock({
      block,
      async execute() {
        const result = await buttonCreate({
          variables: { input: { ...input, label: NEW_BUTTON_LABEL } },
          optimisticResponse: { campaignButtonBlockCreate: block },
          ...(after != null
            ? {
                update: (cache, { data }) =>
                  campaignBlockInsertUpdate(
                    cache,
                    campaign.id,
                    data?.campaignButtonBlockCreate
                  )
              }
            : {})
        })
        await moveAfter(block)
        return result
      }
    })
  }

  /** A region card's new line: a Typography block scoped to the region, last among its lines. */
  function addLine(): void {
    if (targets.line == null) return
    const { region } = targets.line
    const id = uuidv4()
    const block: CampaignBlock = {
      __typename: 'CampaignTypographyBlock',
      id,
      campaignId: campaign.id,
      pageId: null,
      regionId: region.id,
      parentBlockId: null,
      parentOrder: regionLines(campaign.blocks, region.id).length,
      content: '',
      contentTranslations: [],
      typographyVariant: null,
      align: null,
      color: null,
      placement: null
    }
    addBlock({
      block,
      execute() {
        return typographyCreate({
          variables: {
            input: { id, campaignId: campaign.id, regionId: region.id }
          },
          optimisticResponse: { campaignTypographyBlockCreate: block }
        })
      }
    })
  }

  return { targets, addSection, addExtra, addLine }
}
