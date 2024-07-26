import { useCommand } from '@core/journeys/ui/CommandProvider'
import {
  ActiveContent,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { BlockFields } from '../../../../../__generated__/BlockFields'
import { BlockRestore_blockRestore as RestoredBlock } from '../../../../../__generated__/BlockRestore'
import { useBlockDeleteMutation } from '../../../../libs/useBlockDeleteMutation'
import { useBlockRestoreMutation } from '../../../../libs/useBlockRestoreMutation'

interface AddBlockParameters {
  execute: () => Promise<BlockFields | undefined>
}

export function useBlockCreateCommand(): {
  addBlock: (params: AddBlockParameters) => Promise<void>
} {
  const { add } = useCommand()
  const [blockDelete] = useBlockDeleteMutation()
  const [blockRestore] = useBlockRestoreMutation()
  const {
    state: { selectedStep },
    dispatch
  } = useEditor()

  async function addBlock({ execute }: AddBlockParameters): Promise<void> {
    let block: BlockFields | undefined
    await add({
      parameters: {
        execute: {},
        undo: {},
        redo: { selectedStep }
      },
      execute: async () => {
        block = await execute()
      },
      undo: async () => {
        if (block == null) return
        dispatch({
          type: 'SetEditorFocusAction',
          selectedStepId: selectedStep?.id,
          activeContent: ActiveContent.Canvas,
          activeSlide: ActiveSlide.Content
        })
        await blockDelete(block, { optimisticResponse: { blockDelete: [] } })
      },
      redo: async ({ selectedStep }) => {
        if (block == null) return
        dispatch({
          type: 'SetEditorFocusAction',
          selectedStepId: selectedStep?.id,
          selectedBlockId: block.id,
          activeContent: ActiveContent.Canvas,
          activeSlide: ActiveSlide.Content
        })
        await blockRestore({
          variables: {
            id: block.id
          },
          optimisticResponse: {
            blockRestore: [block as unknown as RestoredBlock]
          }
        })
      }
    })
  }

  return { addBlock }
}
