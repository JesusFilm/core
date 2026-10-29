import { v4 as uuidv4 } from 'uuid'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import { CampaignChildPlacement } from '../../../../../__generated__/globalTypes'
import { useCampaignButtonBlockCreateMutation } from '../../../../libs/useCampaignButtonBlockCreateMutation'
import { CampaignSectionTypename } from '../../../../libs/useCampaignSectionCreateMutation'
import { useCampaignTypographyBlockCreateMutation } from '../../../../libs/useCampaignTypographyBlockCreateMutation'
import { regionLines, useCampaignEditor } from '../../CampaignEditorProvider'
import { useCampaignBlockCreateCommand } from '../useCampaignBlockCreateCommand'
import { useCampaignSectionAdd } from '../useCampaignSectionAdd'

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
    const { host, inheritsPlacement } = targets.extra
    const placement =
      inheritsPlacement || chosenPlacement == null
        ? targets.extra.placement
        : chosenPlacement
    const id = uuidv4()
    const siblings = campaign.blocks.filter(
      (candidate) =>
        candidate.parentBlockId === host.id && candidate.parentOrder != null
    )
    const base = {
      id,
      campaignId: campaign.id,
      pageId: host.pageId,
      regionId: host.regionId,
      parentBlockId: host.id,
      parentOrder: siblings.length,
      placement
    }
    const input = {
      id,
      campaignId: campaign.id,
      parentBlockId: host.id,
      placement
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
        execute() {
          return typographyCreate({
            variables: { input },
            optimisticResponse: { campaignTypographyBlockCreate: block }
          })
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
      execute() {
        return buttonCreate({
          variables: { input: { ...input, label: NEW_BUTTON_LABEL } },
          optimisticResponse: { campaignButtonBlockCreate: block }
        })
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
