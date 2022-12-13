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

  // it('should display correct link', () => {
  //   const routePrefix = 'thisIsTheRoutePrefix'
  //   const { getAllByLabelText } = render(
  //     <VideosGrid videos={videos.slice(0, 7)} routePrefix={routePrefix} />
  //   )
  //   const videosGridArray = getAllByLabelText('collection-page-video-card')
  // })
})
