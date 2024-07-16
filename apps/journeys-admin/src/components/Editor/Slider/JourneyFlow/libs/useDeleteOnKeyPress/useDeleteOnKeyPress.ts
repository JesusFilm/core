import { useEffect, useState } from 'react'
import { Edge, OnSelectionChangeFunc, useKeyPress } from 'reactflow'

import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TreeBlock } from '@core/journeys/ui/block'
import { BlockFields } from '../../../../../../../__generated__/BlockFields'
import { blockDeleteUpdate } from '../../../../../../libs/blockDeleteUpdate'
import { useBlockDeleteMutation } from '../../../../../../libs/useBlockDeleteMutation'
import {
  blockRestoreCacheUpdate,
  setBlockRestoreEditorState,
  useBlockRestoreMutation
} from '../../../../../../libs/useBlockRestoreMutation'
import getSelected from '../../../Content/Canvas/QuickControls/DeleteBlock/utils/getSelected'
import { useDeleteEdge } from '../useDeleteEdge'

const isEdge = (element: Edge | BlockFields): element is Edge =>
  'source' in element && 'target' in element

export function useDeleteOnKeyPress(): {
  onSelectionChange: OnSelectionChangeFunc
} {
  const {
    state: { selectedBlock, activeSlide, showAnalytics, selectedStep, steps },
    dispatch
  } = useEditor()
  const { journey } = useJourney()

  const deleteEdge = useDeleteEdge()
  const [blockDelete] = useBlockDeleteMutation()
  const [selected, setSelected] = useState<Edge | BlockFields | undefined>()
  const { add } = useCommand()
  const [blockRestore] = useBlockRestoreMutation()

  // Set selected node or edge using selectedBlock and reactflow OnSelectionChange
  const onSelectionChange: OnSelectionChangeFunc = ({ edges }) => {
    if (edges.length > 0) {
      setSelected(edges[0])
    }
  }

  // Uses selected block for determining the current selected item.
  // Important to set the selected item when creating a node
  useEffect(() => {
    if (selectedBlock == null) {
      setSelected(undefined)
    } else if (selectedBlock.__typename === 'StepBlock') {
      setSelected(selectedBlock)
    }
  }, [selectedBlock])

  const deleteEvent = useKeyPress(['Delete', 'Backspace'])

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (
      deleteEvent &&
      selected != null &&
      activeSlide === ActiveSlide.JourneyFlow &&
      showAnalytics !== true
    ) {
      if (isEdge(selected)) {
        void deleteEdge({
          source: selected.source,
          sourceHandle: selected.sourceHandle
        })
      } else if (selectedBlock != null && steps != null && journey != null) {
        const deletedBlockParentOrder = selectedBlock.parentOrder
        const deletedBlockType = selectedBlock.__typename
        const stepsBeforeDelete = steps
        const stepBeforeDelete = selectedStep

        void add({
          parameters: {
            execute: {},
            undo: {}
          },
          async execute() {
            if (selectedStep != null) {
              setBlockRestoreEditorState(selectedBlock, selectedStep, dispatch)
              await blockDelete(selected, {
                update(cache, { data }) {
                  if (
                    data?.blockDelete != null &&
                    deletedBlockParentOrder != null
                  ) {
                    const selected = getSelected({
                      parentOrder: deletedBlockParentOrder,
                      siblings: data.blockDelete,
                      type: deletedBlockType,
                      steps: stepsBeforeDelete,
                      selectedStep: stepBeforeDelete
                    })
                    selected != null && dispatch(selected)
                  }
                  blockDeleteUpdate(
                    selectedBlock,
                    data?.blockDelete,
                    cache,
                    journey.id
                  )
                }
              })
            }
          },
          async undo() {
            if (selectedStep != null) {
              await blockRestore({
                variables: { blockRestoreId: selected.id },
                update(cache, { data }) {
                  if (data != null) {
                    blockRestoreCacheUpdate(
                      cache,
                      data,
                      cache.identify({
                        __typename: 'Journey',
                        id: journey?.id
                      })
                    )
                    if (selected.__typename === 'StepBlock')
                      blockRestoreCacheUpdate(cache, data)
                  }
                }
              })
              setBlockRestoreEditorState(selectedBlock, selectedStep, dispatch)
            }
          }
        })
      }

      setSelected(undefined)
    }
  }, [deleteEvent])

  return { onSelectionChange }
}
