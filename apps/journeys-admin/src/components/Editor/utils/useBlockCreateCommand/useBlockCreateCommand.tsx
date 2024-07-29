import { useCommand } from '@core/journeys/ui/CommandProvider'
import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'
import { TreeBlock } from '@core/journeys/ui/block'
import { BlockFields } from '../../../../../__generated__/BlockFields'
import { BlockRestore_blockRestore as RestoredBlock } from '../../../../../__generated__/BlockRestore'
import { useBlockDeleteMutation } from '../../../../libs/useBlockDeleteMutation'
import { useBlockRestoreMutation } from '../../../../libs/useBlockRestoreMutation'

interface AddBlockParameters {
  execute: () => Promise<void>
  optimisticBlock: TreeBlock<BlockFields>
}

export function useBlockCreateCommand(): {
  addBlock: (params: AddBlockParameters) => Promise<void>
} {
  const { add } = useCommand()
  const [blockDelete] = useBlockDeleteMutation()
  const [blockRestore] = useBlockRestoreMutation()
  const {
    state: { selectedStep, selectedBlock },
    dispatch
  } = useEditor()

  async function addBlock({
    optimisticBlock,
    execute
  }: AddBlockParameters): Promise<void> {
    void add({
      parameters: {
        execute: {},
        undo: {
          selectedStep,
          previousBlock: selectedBlock,
          block: optimisticBlock
        },
        redo: { selectedStep, block: optimisticBlock }
      },
      execute: () => {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlockId: optimisticBlock.id,
          activeSlide: ActiveSlide.Content
        })
        void execute()
      },
      undo: async ({ selectedStep, previousBlock, block }) => {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedStepId: selectedStep?.id,
          selectedBlockId: previousBlock?.id,
          activeSlide: ActiveSlide.Content
        })
        await blockDelete(block, {
          optimisticResponse: { blockDelete: [] }
        })
      },
      redo: async ({ selectedStep, block }) => {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedStepId: selectedStep?.id,
          selectedBlockId: optimisticBlock.id,
          activeSlide: ActiveSlide.Content
        })
        await blockRestore({
          variables: {
            id: block.id
          },
          optimisticResponse: {
            blockRestore: [{ ...block } as unknown as RestoredBlock]
          }
        })
      }
    })
  }

  return { addBlock }
}
