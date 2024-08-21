import { TreeBlock } from '@core/journeys/ui/block'
import { BlockFields_CardBlock as CardBlock } from '@core/journeys/ui/block/__generated__/BlockFields'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import {
  ActiveContent,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'

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

  const {
    dispatch,
    state: { selectedStep, selectedBlock, steps }
  } = useEditor()
  const [blockDelete] = useBlockDeleteMutation()
  const [blockRestore] = useBlockRestoreMutation()

  function flatten(children: TreeBlock[]): TreeBlock[] {
    return children?.reduce<TreeBlock[]>((result, item) => {
      result.push(item)
      result.push(...flatten(item.children))
      return result
    }, [])
  }

  function addBlockDuplicate({
    block,
    execute
  }: AddBlockDuplicateParams): void {
    if (selectedStep == null || steps == null) return

    const card = selectedStep.children.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined

    add({
      parameters: { execute: {}, undo: { card, steps } },
      execute,
      undo({ card, steps }) {
        if (card == null) return

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
          optimisticResponse: {
            blockDelete:
              block.__typename === 'StepBlock'
                ? [...steps]
                : [...flatten(card.children)]
          }
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
            blockRestore:
              block.__typename === 'StepBlock'
                ? [block as BlockRestore]
                : [block as BlockRestore]
          }
        })
      }
    })
  }

  return { addBlockDuplicate }
}
