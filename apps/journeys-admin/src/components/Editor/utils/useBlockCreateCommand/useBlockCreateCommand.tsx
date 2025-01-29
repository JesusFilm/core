import { useCommand } from '@core/journeys/ui/CommandProvider'
import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { BlockFields } from '../../../../../__generated__/BlockFields'
import { journeyUpdatedAtCacheUpdate } from '../../../../libs/journeyUpdatedAtCacheUpdate'
import { useBlockDeleteMutation } from '../../../../libs/useBlockDeleteMutation'
import { useBlockRestoreMutation } from '../../../../libs/useBlockRestoreMutation'

interface AddBlockParameters {
  execute: () => void
  block: BlockFields
}

export function useBlockCreateCommand(): {
  addBlock: (params: AddBlockParameters) => void
} {
  const { add } = useCommand()
  const { journey } = useJourney()
  const [blockDelete] = useBlockDeleteMutation()
  const [blockRestore] = useBlockRestoreMutation()
  const {
    state: { selectedStep, selectedBlock },
    dispatch
  } = useEditor()

  function addBlock({ block, execute }: AddBlockParameters): void {
    if (journey != null) {
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
            activeSlide: ActiveSlide.Content
          })
          void execute()
        },
        undo({ selectedStep, previousBlock, block }) {
          dispatch({
            type: 'SetEditorFocusAction',
            selectedStep,
            selectedBlockId: previousBlock?.id,
            activeSlide: ActiveSlide.Content
          })
          void blockDelete(block, {
            optimisticResponse: { blockDelete: [] },
            update(cache) {
              journeyUpdatedAtCacheUpdate(cache, journey.id)
            }
          })
        },
        redo({ selectedStep, block }) {
          dispatch({
            type: 'SetEditorFocusAction',
            selectedStep,
            selectedBlockId: block?.id,
            activeSlide: ActiveSlide.Content
          })
          void blockRestore({
            variables: {
              id: block?.id
            },
            optimisticResponse: {
              blockRestore:
                block?.__typename !== 'StepBlock' ? [{ ...block }] : []
            },
            update(cache) {
              journeyUpdatedAtCacheUpdate(cache, journey.id)
            }
          })
        }
      })
    }
  }

  return { addBlock }
}
