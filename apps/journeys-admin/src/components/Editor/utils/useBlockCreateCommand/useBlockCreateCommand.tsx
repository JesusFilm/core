import { useCommand } from '@core/journeys/ui/CommandProvider'
import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'

import { BlockFields } from '../../../../../__generated__/BlockFields'
import { useBlockDeleteMutation } from '../../../../libs/useBlockDeleteMutation'
import { useBlockRestoreMutation } from '../../../../libs/useBlockRestoreMutation'
import { useEditorLayout } from '../../EditorLayoutContext'

interface AddBlockParameters {
  execute: () => void
  block: BlockFields
}

export function useBlockCreateCommand(): {
  addBlock: (params: AddBlockParameters) => void
} {
  const { add } = useCommand()
  const [blockDelete] = useBlockDeleteMutation()
  const [blockRestore] = useBlockRestoreMutation()
  const {
    state: { selectedStep, selectedBlock },
    dispatch
  } = useEditor()
  const { isLayered } = useEditorLayout()
  const focusSlide = isLayered ? ActiveSlide.Drawer : ActiveSlide.Content

  function addBlock({ block, execute }: AddBlockParameters): void {
    add({
      parameters: {
        execute: {},
        undo: {
          selectedStep,
          previousBlock: selectedBlock,
          block
        },
        redo: { selectedStep, block }
      },
      execute() {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlockId: block?.id,
          activeSlide: focusSlide
        })
        void execute()
      },
      undo({ selectedStep, previousBlock, block }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedStep,
          selectedBlockId: previousBlock?.id,
          activeSlide: focusSlide
        })
        void blockDelete(block, {
          optimisticResponse: { blockDelete: [] }
        })
      },
      redo({ selectedStep, block }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedStep,
          selectedBlockId: block?.id,
          activeSlide: focusSlide
        })
        void blockRestore({
          variables: {
            id: block?.id
          },
          optimisticResponse: {
            blockRestore:
              block?.__typename !== 'StepBlock' ? [{ ...block }] : []
          }
        })
      }
    })
  }

  return { addBlock }
}
