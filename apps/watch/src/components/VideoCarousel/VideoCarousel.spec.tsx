import { render, waitFor } from '@testing-library/react'

import { videos } from '../Videos/__generated__/testData'

import { VideoCarousel } from './VideoCarousel'

describe('VideosCarousel', () => {
  it('should display video items', async () => {
    const { getByRole, getByText } = render(
      <VideoCarousel activeVideoId={videos[0].id} videos={videos} />
    )

    await waitFor(() => expect(getByText('Playing now')).toBeInTheDocument())
    expect(getByRole('heading', { name: 'JESUS' })).toBeInTheDocument()
  })
})
