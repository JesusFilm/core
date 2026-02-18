import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { VideoSearch } from './VideoSearch'

describe('VideoSearch', () => {
  it('has value in textbox', () => {
    render(<VideoSearch value="Jesus" onChange={jest.fn()} />)
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue(
      'Jesus'
    )
  })

  it('calls onChange on change', async () => {
    const onChange = jest.fn()
    render(<VideoSearch onChange={onChange} />)
    const searchBox = screen.getByRole('searchbox', { name: 'Search' })
    await waitFor(() =>
      fireEvent.change(searchBox, {
        target: { value: 'Jesus' }
      })
    )
    await waitFor(() => expect(onChange).toHaveBeenCalled())
  })

  it('uses the search icon if tab is internal', () => {
    const { getByTestId } = render(
      <VideoSearch onChange={jest.fn()} icon="search" />
    )
    expect(getByTestId('Search1Icon')).toBeInTheDocument()
  })

  it('uses the link icon if tab is youtube', () => {
    const { getByTestId } = render(
      <VideoSearch onChange={jest.fn()} icon="link" />
    )
    expect(getByTestId('LinkIcon')).toBeInTheDocument()
  })
})
