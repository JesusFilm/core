import { useEffect, useState } from 'react'
import { Edge, OnSelectionChangeFunc, useKeyPress } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'
import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'

import { useBlockDeleteMutation } from '../../../../../../libs/useBlockDeleteMutation'
import { useDeleteEdge } from '../useDeleteEdge'

const isEdge = (element: Edge | TreeBlock): element is Edge =>
  'source' in element && 'target' in element

export function useDeleteOnKeyPress(): {
  onSelectionChange: OnSelectionChangeFunc
} {
  const {
    state: { selectedBlock, activeSlide }
  } = useEditor()
  const deleteEdge = useDeleteEdge()
  const [blockDelete] = useBlockDeleteMutation()
  const [selected, setSelected] = useState<Edge | TreeBlock | undefined>()

  // Set selected node or edge using selectedBlock and reactflow OnSelectionChange
  const onSelectionChange: OnSelectionChangeFunc = ({ edges }) => {
    if (edges.length > 0) {
      setSelected(edges[0])
    }
  }

  useEffect(() => {
    if (selectedBlock == null) {
      setSelected(undefined)
    } else if (selectedBlock.__typename === 'StepBlock') {
      setSelected(selectedBlock)
    }
  }, [selectedBlock])

  // Delete Selected Item logic
  const deleteEvent = useKeyPress(['Delete', 'Backspace'])

  useEffect(
    function handleDeleteEvent() {
      if (
        deleteEvent &&
        selected != null &&
        activeSlide === ActiveSlide.JourneyFlow
      ) {
        if (isEdge(selected)) {
          void deleteEdge(selected.source, selected.sourceHandle)
        } else {
          void blockDelete(selected)
        }

        setSelected(undefined)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deleteEvent]
  )

  return { onSelectionChange }
}
