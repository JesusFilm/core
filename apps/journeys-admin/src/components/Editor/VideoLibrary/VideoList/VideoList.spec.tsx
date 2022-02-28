import { render, fireEvent, waitFor } from '@testing-library/react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { VideoList } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('Video List', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))

  it('should render a video list item', () => {
    const { getAllByRole, getAllByTestId } = render(
      <VideoList onSelect={() => console.log('onSelect')} />
    )

    const videoListItem = getAllByRole('button')
    expect(videoListItem[0]).toHaveClass('MuiListItemButton-root')
    expect(videoListItem[0]).toHaveTextContent('Fact or fiction')
    expect(videoListItem[0]).toContainElement(
      getAllByTestId('TranslateRoundedIcon')[0]
    )
    expect(videoListItem[0]).toHaveTextContent('EN (US)')
    expect(videoListItem[0]).toHaveTextContent('1:34')
  })

  it('should render more video list items on click', async () => {
    const { getByTestId, getAllByRole } = render(
      <VideoList onSelect={() => console.log('onSelect')} />
    )
    expect(getByTestId('video-list-chip')).toBeInTheDocument()
    expect(getAllByRole('button')[0]).toHaveTextContent('Fact or fiction')
    expect(getAllByRole('button')).toHaveLength(5)
    fireEvent.click(getByTestId('video-list-chip'))
    await waitFor(() =>
      expect(getAllByRole('button')[4]).toHaveTextContent('Fact or fiction')
    )
    expect(getAllByRole('button')).toHaveLength(9)
  })
})
