import { DndContext } from '@dnd-kit/core'
import { render, screen } from '@testing-library/react'

import '../../../../test/i18n'

import { DraggableJourneysGrid } from './Droppables'

// Empty-journeys renders only — mounting real cards would pull in
// JourneyCard's provider stack, and the placeholder behavior under test
// is independent of the cards.
function renderGrid(
  props: Partial<Parameters<typeof DraggableJourneysGrid>[0]> = {}
): ReturnType<typeof render> {
  return render(
    <DndContext>
      <DraggableJourneysGrid journeys={[]} dragInFlight={false} {...props} />
    </DndContext>
  )
}

describe('DraggableJourneysGrid drop placeholder (NES-1703)', () => {
  it('renders the placeholder tile for an empty collection when showDropPlaceholder is set', () => {
    renderGrid({ showDropPlaceholder: true })
    expect(screen.getByTestId('CollectionDropPlaceholder')).toBeInTheDocument()
    expect(screen.getByText('Drag templates here')).toBeInTheDocument()
  })

  it('renders nothing for an empty grid without showDropPlaceholder (unsectioned pool)', () => {
    renderGrid()
    expect(
      screen.queryByTestId('CollectionDropPlaceholder')
    ).not.toBeInTheDocument()
  })
})
