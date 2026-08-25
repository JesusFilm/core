import { Edge, OnSelectionChangeFunc, useKeyPress } from '@xyflow/react'
import { useEffect, useState } from 'react'

import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'

import { useBlockDeleteCommand } from '../../../../utils/useBlockDeleteCommand'
import { useDeleteEdge } from '../useDeleteEdge'

export function useDeleteOnKeyPress(): {
  onSelectionChange: OnSelectionChangeFunc
} {
  const {
    state: { selectedBlock, activeSlide, showAnalytics }
  } = useEditor()

  const deleteEdge = useDeleteEdge()
  const { addBlockDelete } = useBlockDeleteCommand()
  const deleteEvent = useKeyPress(['Delete', 'Backspace'])

  // Track only the reactflow edge selection. The card selection already lives
  // in selectedBlock, so each has a single source of truth and the two can't
  // drift out of sync.
  const [selectedEdge, setSelectedEdge] = useState<Edge | undefined>()

  const onSelectionChange: OnSelectionChangeFunc = ({ edges }) => {
    setSelectedEdge(edges.length > 0 ? edges[0] : undefined)
  }

  useEffect(() => {
    if (
      !deleteEvent ||
      activeSlide !== ActiveSlide.JourneyFlow ||
      showAnalytics === true
    )
      return

    // A selected edge takes precedence; otherwise delete the selected card.
    if (selectedEdge != null) {
      void deleteEdge({
        source: selectedEdge.source,
        sourceHandle: selectedEdge.sourceHandle
      })
      setSelectedEdge(undefined)
    } else if (selectedBlock?.__typename === 'StepBlock') {
      addBlockDelete(selectedBlock)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteEvent])

  return { onSelectionChange }
}
