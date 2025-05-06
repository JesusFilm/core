import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { LinkFile } from './LinkFile'

describe('LinkFile', () => {
  const mockProps = {
    name: 'test-file.vtt',
    link: 'https://example.com/test-file.vtt'
  }

  it('should render with the correct name and link', () => {
    render(<LinkFile {...mockProps} />)

    const linkElement = screen.getByText('test-file.vtt')
    expect(linkElement).toBeInTheDocument()
    expect(linkElement).toHaveAttribute(
      'href',
      'https://example.com/test-file.vtt'
    )
    expect(linkElement).toHaveAttribute('target', '_blank')
    expect(linkElement).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should not show delete button when onDelete is not provided', () => {
    render(<LinkFile {...mockProps} />)

    expect(
      screen.queryByRole('button', { name: 'delete-file' })
    ).not.toBeInTheDocument()
  })

  it('should show delete button and call onDelete when clicked', async () => {
    const onDelete = jest.fn()
    render(<LinkFile {...mockProps} onDelete={onDelete} />)

    const deleteButton = screen.getByRole('button', { name: 'delete-file' })
    expect(deleteButton).toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(deleteButton)

    expect(onDelete).toHaveBeenCalledTimes(1)
  })
})
