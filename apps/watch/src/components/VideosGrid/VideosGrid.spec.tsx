import { fireEvent, render } from '@testing-library/react'
import { videos } from '../Videos/testData'
import { VideosGrid } from './VideosGrid'

describe('VideosGrid', () => {
  const onLoadMore = jest.fn()

  it('should display loading placeholders', async () => {
    const { getByText, getAllByTestId } = render(
      <VideosGrid videos={[]} loading onLoadMore={onLoadMore} />
    )
    expect(getAllByTestId('videos-grid-placeholder')).toHaveLength(8)
    expect(getByText('Loading...')).toBeInTheDocument()
  })
  it('should request more videos', async () => {
    const { getByText } = render(
      <VideosGrid videos={videos} loading={false} onLoadMore={onLoadMore} />
    )
    fireEvent.click(getByText('Load More'))
    expect(onLoadMore).toHaveBeenCalled()
  })

  it('should render correct number of videos', () => {
    const { getAllByLabelText } = render(<VideosGrid videos={videos} />)
    expect(getAllByLabelText('collection-page-video-card').length).toBe(
      videos.length
    )
  })

  it('should omit route prefix for collection link', () => {
    const routePrefix = 'thisIsTheRoutePrefix'
    const { getByLabelText } = render(
      <VideosGrid videos={[videos[0]]} routePrefix={routePrefix} />
    )
    expect(getByLabelText('collection-page-video-card')).toHaveAttribute(
      'href',
      `/${videos[0].slug}/english`
    )
  })

  it('should have route prefix for non-collection link', () => {
    const routePrefix = 'thisIsTheRoutePrefix'
    const { getByLabelText } = render(
      <VideosGrid videos={[videos[2]]} routePrefix={routePrefix} />
    )
    expect(getByLabelText('collection-page-video-card')).toHaveAttribute(
      'href',
      `/${routePrefix}/${videos[2].slug}/english`
    )
  })
})
