import { DndContext } from '@dnd-kit/core'
import { render, screen } from '@testing-library/react'

import '../../../../test/i18n'

import { CollectionDropReveal, DraggableJourneysGrid } from './Droppables'

// Empty-journeys renders only — mounting real cards would pull in
// JourneyCard's provider stack, and the behaviour under test is independent
// of the cards.
function renderGrid(
  props: Partial<Parameters<typeof DraggableJourneysGrid>[0]> = {}
): ReturnType<typeof render> {
  return render(
    <DndContext>
      <DraggableJourneysGrid
        journeys={[]}
        dragInFlight={false}
        zone={{ kind: 'unsectioned' }}
        {...props}
      />
    </DndContext>
  )
}

describe('DraggableJourneysGrid', () => {
  it('renders nothing for an empty grid — the reveal boxes are the drop affordance now', () => {
    const { container } = renderGrid({ zone: { kind: 'collection', id: 'c1' } })
    // DndContext mounts its own live-region nodes, so check for the grid.
    expect(container.querySelector('.MuiGrid-container')).toBeNull()
    expect(screen.queryByText('Drag templates here')).not.toBeInTheDocument()
  })
})

describe('CollectionDropReveal', () => {
  function renderReveal(
    props: Partial<Parameters<typeof CollectionDropReveal>[0]> = {}
  ): ReturnType<typeof render> {
    return render(
      <DndContext>
        <CollectionDropReveal
          collectionId="c1"
          activeCard={{
            zone: { kind: 'collection', id: 'c2' },
            journeyId: 'j1'
          }}
          isMember={false}
          sourceCollectionTitle="Easter 2026"
          variant="overlay"
          disabled={false}
          {...props}
        />
      </DndContext>
    )
  }

  it('renders nothing when no drag is active', () => {
    renderReveal({ activeCard: null })
    expect(
      screen.queryByTestId('CollectionDropReveal-c1')
    ).not.toBeInTheDocument()
  })

  it('renders nothing for the collection the card was picked up from', () => {
    renderReveal({
      activeCard: { zone: { kind: 'collection', id: 'c1' }, journeyId: 'j1' }
    })
    expect(
      screen.queryByTestId('CollectionDropReveal-c1')
    ).not.toBeInTheDocument()
  })

  it('shows Move here and Link here when dragging from another collection', () => {
    renderReveal()
    expect(screen.getByTestId('CollectionDropZone-move-c1')).toHaveTextContent(
      'Move here'
    )
    expect(screen.getByTestId('CollectionDropZone-move-c1')).toHaveTextContent(
      'Leaves Easter 2026'
    )
    expect(screen.getByTestId('CollectionDropZone-link-c1')).toHaveTextContent(
      'Link here'
    )
  })

  it('shows a single Add here box when dragging from All Templates', () => {
    renderReveal({
      activeCard: { zone: { kind: 'unsectioned' }, journeyId: 'j1' },
      sourceCollectionTitle: null
    })
    expect(screen.getByTestId('CollectionDropZone-link-c1')).toHaveTextContent(
      'Add here'
    )
    expect(
      screen.queryByTestId('CollectionDropZone-move-c1')
    ).not.toBeInTheDocument()
  })

  it('shows a single dimmed Already here box when the template is already in the collection', () => {
    renderReveal({ isMember: true })
    expect(screen.getByTestId('CollectionDropZone-link-c1')).toHaveTextContent(
      'Already here'
    )
    expect(
      screen.queryByTestId('CollectionDropZone-move-c1')
    ).not.toBeInTheDocument()
  })

  it('renders the row variant in flow for collapsed collections', () => {
    renderReveal({ variant: 'row' })
    expect(screen.getByTestId('CollectionDropReveal-c1')).toHaveStyle({
      position: 'relative'
    })
  })
})
