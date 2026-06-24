import { render, screen } from '@testing-library/react'

import { LabelChip } from './LabelChip'

describe('LabelChip', () => {
  it('renders the label and forwards data-testid', () => {
    render(<LabelChip label="Draft" data-testid="status-chip" />)

    expect(screen.getByTestId('status-chip')).toBeInTheDocument()
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('renders the success (Live) variant', () => {
    render(<LabelChip label="Live" color="success" />)

    expect(screen.getByText('Live')).toBeInTheDocument()
  })
})
