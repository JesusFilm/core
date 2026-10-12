import { useCommand } from '@core/journeys/ui/CommandProvider'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import { CampaignPageKind } from '../../../../../__generated__/globalTypes'
import { useCampaignBlockDeleteMutation } from '../../../../libs/useCampaignBlockDeleteMutation'
import { useCampaignBlockRestoreMutation } from '../../../../libs/useCampaignBlockRestoreMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { siblingsOf } from '../useCampaignBlockDeleteCommand'

interface AddBlockParameters {
  /** The new block as its create mutation's optimistic response renders it. */
  block: CampaignBlock
  /** Runs the create mutation. */
  execute: () => void
}

interface UndoParameters {
  block: CampaignBlock
  previousBlockId?: string
  pageKind: CampaignPageKind
  /** The siblings as they stand without the new block: what its delete returns. */
  siblings: Array<{
    __typename: CampaignBlock['__typename']
    id: string
    parentOrder: number
  }>
}

interface RedoParameters {
  block: CampaignBlock
  pageKind: CampaignPageKind
}

/**
 * Adding a block (an Extra or a section) is one Command: execute selects the
 * new block and runs the create; undo focuses the page it was made on,
 * restores the previous selection and soft-deletes it, with the siblings
 * renumbered at once; redo restores it through `campaignBlockRestore`.
 */
export function useCampaignBlockCreateCommand(): {
  addBlock: (params: AddBlockParameters) => void
} {
  const { add } = useCommand()
  const {
    campaign,
    state: { pageKind, selectedBlockId },
    dispatch,
    pageKindOf
  } = useCampaignEditor()
  const [blockDelete] = useCampaignBlockDeleteMutation(campaign.id)
  const [blockRestore] = useCampaignBlockRestoreMutation(campaign.id)

  function addBlock({ block, execute }: AddBlockParameters): void {
    const blockPageKind = pageKindOf(block) ?? pageKind
    const siblings = siblingsOf(campaign.blocks, block).map(
      (sibling, parentOrder) => ({
        __typename: sibling.__typename,
        id: sibling.id,
        parentOrder
      })
    )
    add<Record<string, never>, RedoParameters, UndoParameters>({
      parameters: {
        execute: {},
        undo: {
          block,
          previousBlockId: selectedBlockId,
          pageKind: blockPageKind,
          siblings
        },
        redo: { block, pageKind: blockPageKind }
      },
      execute() {
        dispatch({
          type: 'SetEditorFocusAction',
          pageKind: blockPageKind,
          selectedBlockId: block.id
        })
        execute()
      },
      undo({
        block: created,
        previousBlockId,
        pageKind: targetPageKind,
        siblings: siblingsAfter
      }) {
        dispatch({
          type: 'SetEditorFocusAction',
          pageKind: targetPageKind,
          selectedBlockId: previousBlockId
        })
        void blockDelete({
          variables: { id: created.id },
          optimisticResponse: { campaignBlockDelete: siblingsAfter }
        })
      },
      redo({ block: created, pageKind: targetPageKind }) {
        dispatch({
          type: 'SetEditorFocusAction',
          pageKind: targetPageKind,
          selectedBlockId: created.id
        })
        void blockRestore({
          variables: { id: created.id },
          optimisticResponse: { campaignBlockRestore: [created] }
        })
      }
    })
  }

  return { addBlock }
}
