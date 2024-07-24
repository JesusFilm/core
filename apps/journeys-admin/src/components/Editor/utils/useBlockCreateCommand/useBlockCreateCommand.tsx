import { useCommand } from '@core/journeys/ui/CommandProvider'
import {
  ActiveContent,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { BlockFields } from '../../../../../__generated__/BlockFields'
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

        await blockDelete(block)
        dispatch({
          type: 'SetEditorFocusAction',
          activeContent: ActiveContent.Canvas,
          activeSlide: ActiveSlide.Content
        })
      },
      redo: async ({ selectedStep }) => {
        if (block == null) return

        await blockRestore({
          variables: {
            id: block.id
          }
        })
        dispatch({
          type: 'SetEditorFocusAction',
          activeContent: ActiveContent.Canvas,
          activeSlide: ActiveSlide.Content
        })
        // TODO: use selectedStep in SetSelectedStepByIdAction to set the step
        // replace the below
        dispatch({
          type: 'SetSelectedBlockByIdAction',
          selectedBlockId: block.id
        })
      }
    })
  }

  return { addBlock }
}
