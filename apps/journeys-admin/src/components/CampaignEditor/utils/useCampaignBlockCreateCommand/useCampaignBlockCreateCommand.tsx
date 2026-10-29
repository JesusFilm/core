import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import { useCampaignBlockDeleteMutation } from '../../../../libs/useCampaignBlockDeleteMutation'
import { useCampaignBlockRestoreMutation } from '../../../../libs/useCampaignBlockRestoreMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { siblingsOf } from '../useCampaignBlockDeleteCommand'
import { useCampaignCommand } from '../useCampaignCommand'
import { useCommandFailure } from '../useCommandFailure'

interface AddBlockParameters {
  /** The new block as its create mutation's optimistic response renders it. */
  block: CampaignBlock
  /** Runs the create mutation; rejects when the API refuses it. */
  execute: () => Promise<unknown>
}

/**
 * Adding a block (an Extra or a section) is one Command: execute selects the
 * new block and runs the create; undo returns to the page and selection it
 * was made on and soft-deletes it, with the siblings renumbered at once;
 * redo selects it and restores it through `campaignBlockRestore`. When the
 * create is refused the block never existed: the selection goes back at
 * once, the refusal shows in the snackbar, undo sends nothing (even when it
 * was pressed while the create was in flight) and redo runs the create again
 * instead of restoring it.
 */
export function useCampaignBlockCreateCommand(): {
  addBlock: (params: AddBlockParameters) => void
} {
  const { addCampaignCommand } = useCampaignCommand()
  const { campaign } = useCampaignEditor()
  const [blockDelete] = useCampaignBlockDeleteMutation(campaign.id)
  const [blockRestore] = useCampaignBlockRestoreMutation(campaign.id)
  const reportFailure = useCommandFailure()

  function addBlock({ block, execute }: AddBlockParameters): void {
    const siblings = siblingsOf(campaign.blocks, block).map(
      (sibling, parentOrder) => ({
        __typename: sibling.__typename,
        id: sibling.id,
        parentOrder
      })
    )
    const selectCreated = {
      selectedBlockId: block.id,
      selectedRegionId: undefined
    }
    addCampaignCommand({
      focus: { execute: selectCreated, redo: selectCreated },
      execute,
      undo: async () =>
        await blockDelete({
          variables: { id: block.id },
          optimisticResponse: { campaignBlockDelete: siblings }
        }),
      redo: async () =>
        await blockRestore({
          variables: { id: block.id },
          optimisticResponse: { campaignBlockRestore: [block] }
        })
    }).catch((error: unknown) => reportFailure(error))
  }

  return { addBlock }
}
