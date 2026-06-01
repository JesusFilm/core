import { DndContext } from '@dnd-kit/core'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import '../../../../test/i18n'

import { AllTemplatesChip } from './AllTemplatesChip'

function renderChip(
  props: Partial<React.ComponentProps<typeof AllTemplatesChip>> = {}
) {
  return render(
    <DndContext>
      <AllTemplatesChip
        selected={false}
        count={7}
        onSelect={vi.fn()}
        {...props}
      />
    </DndContext>
  )
}

describe('AllTemplatesChip', () => {
  it('renders the label and count', () => {
    renderChip()
    expect(screen.getByText('All Templates')).toBeInTheDocument()
    expect(screen.getByText('7 templates')).toBeInTheDocument()
  })

  it('marks aria-pressed when selected', () => {
    renderChip({ selected: true })
    expect(screen.getByTestId('AllTemplatesChip')).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('calls onSelect when clicked', async () => {
    const handleSelect = vi.fn()
    renderChip({ onSelect: handleSelect })
    await userEvent.click(screen.getByTestId('AllTemplatesChip'))
    expect(handleSelect).toHaveBeenCalledTimes(1)
  })
})
