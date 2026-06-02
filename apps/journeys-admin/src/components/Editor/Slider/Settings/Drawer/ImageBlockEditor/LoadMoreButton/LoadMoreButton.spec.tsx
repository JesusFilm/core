import { fireEvent, render, screen } from '@testing-library/react'

import { LoadMoreButton } from './LoadMoreButton'

describe('LoadMoreButton', () => {
  it('should render "Load More" when hasMore is true and not loading', () => {
    render(<LoadMoreButton hasMore loading={false} onClick={vi.fn()} />)
    expect(
      screen.getByRole('button', { name: 'Load More' })
    ).toBeInTheDocument()
  })

  it('should render "Loading..." when loading is true', () => {
    render(<LoadMoreButton hasMore loading onClick={vi.fn()} />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should render nothing when hasMore is false and not loading', () => {
    const { container } = render(
      <LoadMoreButton hasMore={false} loading={false} onClick={vi.fn()} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('should disable the button when loading is true', () => {
    render(<LoadMoreButton hasMore loading onClick={vi.fn()} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should be enabled when hasMore is true and not loading', () => {
    render(<LoadMoreButton hasMore loading={false} onClick={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Load More' })).toBeEnabled()
  })

  it('should render "Loading..." when loading is true even if hasMore is false', () => {
    render(<LoadMoreButton hasMore={false} loading onClick={vi.fn()} />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should call onClick when the button is clicked', () => {
    const handleClick = vi.fn()
    render(<LoadMoreButton hasMore loading={false} onClick={handleClick} />)
    fireEvent.click(screen.getByRole('button', { name: 'Load More' }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
