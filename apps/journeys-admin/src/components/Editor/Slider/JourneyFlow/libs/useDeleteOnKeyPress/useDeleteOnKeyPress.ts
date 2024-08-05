import { useEffect, useState } from 'react'
import { Edge, OnSelectionChangeFunc, useKeyPress } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'
import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'

import { BlockFields } from '../../../../../../../__generated__/BlockFields'
import { useBlockDeleteCommand } from '../../../../utils/useBlockDeleteCommand'
import { useDeleteEdge } from '../useDeleteEdge'

const isEdge = (element: Edge | BlockFields): element is Edge =>
  'source' in element && 'target' in element

export function useDeleteOnKeyPress(): {
  onSelectionChange: OnSelectionChangeFunc
} {
  const {
    state: { selectedBlock, activeSlide, showAnalytics }
  } = useEditor()

  const deleteEdge = useDeleteEdge()
  const [selected, setSelected] = useState<Edge | TreeBlock | undefined>()

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
  const { addBlockDelete } = useBlockDeleteCommand()

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
      } else {
        if (selected != null) addBlockDelete(selected)
      }

      setSelected(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteEvent])

  return { onSelectionChange }
}
