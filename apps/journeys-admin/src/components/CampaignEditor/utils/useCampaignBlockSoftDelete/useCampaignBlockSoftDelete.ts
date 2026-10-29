import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import { useCampaignBlockDeleteMutation } from '../../../../libs/useCampaignBlockDeleteMutation'
import { useCampaignBlockRestoreMutation } from '../../../../libs/useCampaignBlockRestoreMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { CampaignSiblingRow } from '../siblingsOf'
import { CampaignCommandStepContext } from '../useCampaignCommand'

export interface CampaignBlockSoftDelete {
  /**
   * Soft-delete a block, showing `siblings` (the rows its delete returns:
   * the siblings left, renumbered) at once. A Command step passes its
   * context, so the block's pending text is sent first.
   */
  softDelete: (
    block: Pick<CampaignBlock, 'id'>,
    siblings: CampaignSiblingRow[],
    step?: CampaignCommandStepContext
  ) => Promise<unknown>
  /**
   * Restore a soft-deleted block, with everything deleted with it, showing
   * `rows` (what its restore returns: the block, its siblings renumbered
   * around it and its subtree) at once.
   */
  restore: (
    block: Pick<CampaignBlock, 'id'>,
    rows: CampaignBlock[]
  ) => Promise<unknown>
}

/**
 * The soft-delete and restore pair the structural Commands' steps share:
 * create and duplicate undo with a delete and redo with a restore, delete
 * and change-type the other way round, and the carousel removes and brings
 * back the items it added.
 */
export function useCampaignBlockSoftDelete(): CampaignBlockSoftDelete {
  const { campaign } = useCampaignEditor()
  const [blockDelete] = useCampaignBlockDeleteMutation(campaign.id)
  const [blockRestore] = useCampaignBlockRestoreMutation(campaign.id)

  async function softDelete(
    block: Pick<CampaignBlock, 'id'>,
    siblings: CampaignSiblingRow[],
    step?: CampaignCommandStepContext
  ): Promise<unknown> {
    return await blockDelete({
      variables: { id: block.id },
      optimisticResponse: { campaignBlockDelete: siblings },
      context: step?.flushContext
    })
  }

  async function restore(
    block: Pick<CampaignBlock, 'id'>,
    rows: CampaignBlock[]
  ): Promise<unknown> {
    return await blockRestore({
      variables: { id: block.id },
      optimisticResponse: { campaignBlockRestore: rows }
    })
  }

  return { softDelete, restore }
}
