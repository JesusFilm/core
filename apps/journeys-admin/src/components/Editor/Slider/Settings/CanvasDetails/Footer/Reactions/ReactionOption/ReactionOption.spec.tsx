import { fireEvent, render, screen } from "@testing-library/react"

import { ReactionOption } from "./ReactionOption"

describe('ReactionOption', () => {
  it('should render', () => {
    const mockToggle = jest.fn()

    render(
      <ReactionOption 
        title="Share"
        active={false}
        field="showShareButton"
        toggle={mockToggle}
      />
    )

    expect(screen.getByText('Share')).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('should handle toggle event', () => {
    const mockToggle = jest.fn()

    render(
      <ReactionOption 
        title="Share"
        active={false}
        field="showShareButton"
        toggle={mockToggle}
      />
    )

    fireEvent.click(screen.getByRole('checkbox'))

    expect(mockToggle).toHaveBeenCalled()
  })
})