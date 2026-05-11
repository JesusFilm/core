import { fireEvent, render, screen } from '@testing-library/react'

import { LoadMoreButton } from './LoadMoreButton'

describe('LoadMoreButton', () => {
  it('should render "Load More" when hasMore is true and not loading', () => {
    render(<LoadMoreButton hasMore loading={false} onClick={jest.fn()} />)
    expect(
      screen.getByRole('button', { name: 'Load More' })
    ).toBeInTheDocument()
  })

  it('should render "Loading..." when loading is true', () => {
    render(<LoadMoreButton hasMore loading onClick={jest.fn()} />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should render "No more to load" when hasMore is false', () => {
    render(
      <LoadMoreButton hasMore={false} loading={false} onClick={jest.fn()} />
    )
    expect(
      screen.getByRole('button', { name: 'No more to load' })
    ).toBeInTheDocument()
  })

  it('should disable the button when hasMore is false', () => {
    render(
      <LoadMoreButton hasMore={false} loading={false} onClick={jest.fn()} />
    )
    expect(
      screen.getByRole('button', { name: 'No more to load' })
    ).toBeDisabled()
  })

  it('should disable the button when loading is true', () => {
    render(<LoadMoreButton hasMore loading onClick={jest.fn()} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should be enabled when hasMore is true and not loading', () => {
    render(<LoadMoreButton hasMore loading={false} onClick={jest.fn()} />)
    expect(screen.getByRole('button', { name: 'Load More' })).toBeEnabled()
  })

  it('should call onClick when the button is clicked', () => {
    const handleClick = jest.fn()
    render(<LoadMoreButton hasMore loading={false} onClick={handleClick} />)
    fireEvent.click(screen.getByRole('button', { name: 'Load More' }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
