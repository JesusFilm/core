import { fireEvent, render, screen } from '@testing-library/react'

import { EditorDrawer } from './EditorDrawer'

describe('EditorDrawer', () => {
  it('renders the drawer with children', () => {
    render(
      <EditorDrawer>
        <div data-testid="child-content">Content</div>
      </EditorDrawer>
    )

    expect(screen.getByTestId('SettingsDrawer')).toBeInTheDocument()
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('renders with a title', () => {
    render(
      <EditorDrawer title="Test Title">
        <div>Content</div>
      </EditorDrawer>
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const mockOnClose = jest.fn()

    render(
      <EditorDrawer title="Test Title" onClose={mockOnClose}>
        <div>Content</div>
      </EditorDrawer>
    )

    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })
})
