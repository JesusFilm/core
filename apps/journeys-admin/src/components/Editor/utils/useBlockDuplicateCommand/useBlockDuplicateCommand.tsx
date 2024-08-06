import { useCommand } from '@core/journeys/ui/CommandProvider'
import {
  ActiveContent,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { BlockFields } from '../../../../../__generated__/BlockFields'
import { BlockRestore_blockRestore as BlockRestore } from '../../../../../__generated__/BlockRestore'
import { useBlockDeleteMutation } from '../../../../libs/useBlockDeleteMutation'
import { useBlockRestoreMutation } from '../../../../libs/useBlockRestoreMutation'

interface AddBlockDuplicateParams {
  block: BlockFields
  execute: () => void
}

export function useBlockDuplicateCommand(): {
  addBlockDuplicate: (args: AddBlockDuplicateParams) => void
} {
  const { add } = useCommand()
  const { journey } = useJourney()

  const {
    dispatch,
    state: { selectedStep, selectedBlock }
  } = useEditor()
  const [blockDelete] = useBlockDeleteMutation()
  const [blockRestore] = useBlockRestoreMutation()

  function addBlockDuplicate({
    block,
    execute
  }: AddBlockDuplicateParams): void {
    add({
      parameters: { execute: {}, undo: {} },
      execute() {
        execute()
      },
      undo() {
        if (journey == null) return
        block.__typename === 'StepBlock'
          ? dispatch({
              type: 'SetEditorFocusAction',
              selectedStepId: selectedStep?.id,
              selectedBlockId: selectedStep?.id,
              activeSlide: ActiveSlide.JourneyFlow,
              activeContent: ActiveContent.Canvas
            })
          : dispatch({
              type: 'SetEditorFocusAction',
              selectedStepId: selectedStep?.id,
              selectedBlockId: selectedBlock?.id,
              activeSlide: ActiveSlide.Content,
              activeContent: ActiveContent.Canvas
            })
        void blockDelete(block, {
          optimisticResponse: { blockDelete: [] }
        })
      },
      redo() {
        block.__typename === 'StepBlock'
          ? dispatch({
              type: 'SetEditorFocusAction',
              selectedStepId: block?.id,
              selectedBlockId: block?.id,
              activeSlide: ActiveSlide.JourneyFlow,
              activeContent: ActiveContent.Canvas
            })
          : dispatch({
              type: 'SetEditorFocusAction',
              selectedStepId: selectedStep?.id,
              selectedBlockId: block?.id,
              activeSlide: ActiveSlide.Content,
              activeContent: ActiveContent.Canvas
            })

        void blockRestore({
          variables: { id: block.id },
          optimisticResponse: {
            blockRestore: [block as BlockRestore]
          }
        })
      }
    })
  }

  return { addBlockDuplicate }
}
