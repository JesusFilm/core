import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import { useSearchBox } from 'react-instantsearch'

import { VideoSearch } from './VideoSearch'

jest.mock('react-instantsearch')

const mockUseSearchBox = useSearchBox as jest.MockedFunction<
  typeof useSearchBox
>

describe('VideoSearch', () => {
  const refine = jest.fn()

  beforeEach(() => {
    mockUseSearchBox.mockReturnValue({
      refine
    } as unknown as SearchBoxRenderState)
  })

  it('has value in textbox', () => {
    render(
      <VideoSearch variant="internal" value="Jesus" onChange={jest.fn()} />
    )
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue(
      'Jesus'
    )
  })

  it('calls onChange on change', async () => {
    const onChange = jest.fn()
    render(<VideoSearch variant="internal" onChange={onChange} />)
    const searchBox = screen.getByRole('searchbox', { name: 'Search' })
    await waitFor(() =>
      fireEvent.change(searchBox, {
        target: { value: 'Jesus' }
      })
    )
    await waitFor(() => expect(refine).toHaveBeenCalled())
  })

  it('uses the search icon if tab is internal', () => {
    const { getByTestId } = render(
      <VideoSearch variant="internal" onChange={jest.fn()} icon="search" />
    )
    expect(getByTestId('Search1Icon')).toBeInTheDocument()
  })

  it('uses the link icon if tab is youtube', () => {
    const { getByTestId } = render(
      <VideoSearch variant="youtube" onChange={jest.fn()} icon="link" />
    )
    expect(getByTestId('LinkIcon')).toBeInTheDocument()
  })
})
