import { fireEvent, render } from '@testing-library/react'

import { videos } from '../Videos/__generated__/testData'

import { VideoGrid } from './VideoGrid'

describe('VideoGrid', () => {
  it('should request more videos', async () => {
    const onLoadMore = jest.fn()
    const { getByText } = render(
      <VideoGrid
        videos={videos}
        loading={false}
        hasNextPage
        onLoadMore={onLoadMore}
      />
    )
    fireEvent.click(getByText('Load More'))
    expect(onLoadMore).toHaveBeenCalled()
  })

  it('should render correct number of videos', () => {
    const { getAllByLabelText } = render(<VideoGrid videos={videos} />)
    expect(getAllByLabelText('VideoCard')).toHaveLength(videos.length)
  })
})
