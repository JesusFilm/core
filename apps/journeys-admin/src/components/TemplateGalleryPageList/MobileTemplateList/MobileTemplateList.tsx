import {
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { GetAdminJourneys_journeys as Journey } from '../../../../__generated__/GetAdminJourneys'

import { SortableMobileTemplateListRow } from './SortableMobileTemplateListRow'

export interface MobileTemplateListProps {
  journeys: readonly Journey[]
  /** When true, the rows are sortable for in-place reorder. When false,
   * rows are still draggable (so they can be moved onto a chip), but
   * sortable item indices are not exposed to the drag-end handler — the
   * "All Templates" filter has no stored order to update. */
  allowReorder: boolean
  /** Disables drag activation for every row (e.g. while a dialog is open
   * or a previous mutation is still in flight). */
  dragInFlight: boolean
}

/**
 * Vertical sortable list of templates. Each row exposes its drag handle
 * via `SortableMobileTemplateListRow`. The SortableContext is what makes
 * the row a sortable item AND a drop target with a known index, which
 * the parent's `useDragEndHandler` uses to dispatch a reorder (when the
 * source and target collection match).
 */
export function MobileTemplateList({
  journeys,
  allowReorder,
  dragInFlight
}: MobileTemplateListProps): ReactElement {
  // SortableContext drives index-based reorder. When `allowReorder` is
  // false (the All Templates filter, which has no stored order), we
  // still mount the context so dnd-kit can compute drop targets, but
  // the parent's drag-end handler will receive the existing "unsectioned
  // -> unsectioned: no-op" branch in useDragEndHandler.ts.
  const ids = journeys.map((j) => j.id)
  return (
    <SortableContext items={ids} strategy={verticalListSortingStrategy}>
      <Stack
        data-testid="MobileTemplateList"
        spacing={1}
        sx={{ py: 1 }}
        // The `allowReorder` flag is informational for now — the drag
        // handler's existing "unsectioned" no-op branch covers the
        // disable case. Surface it as a data attribute so tests and
        // future enhancements can read the current mode without
        // re-deriving from props.
        data-allow-reorder={allowReorder ? 'true' : 'false'}
      >
        {journeys.map((journey) => (
          <SortableMobileTemplateListRow
            key={journey.id}
            journey={journey}
            disabled={dragInFlight}
          />
        ))}
      </Stack>
    </SortableContext>
  )
}
