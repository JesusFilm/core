import { fireEvent, render, waitFor } from '@testing-library/react'
import { SWRConfig } from 'swr'

import { VideoBlockSource } from '../../../../../../../../../__generated__/globalTypes'
import { mswServer } from '../../../../../../../../../test/mswServer'
import { getVideosWithOffsetAndUrl } from '../VideoFromYouTube.handlers'

import { YouTubeDetails } from '.'

describe('YouTubeDetails', () => {
  it('should render details of a video', async () => {
    mswServer.use(getVideosWithOffsetAndUrl)
    const { getByText, getByRole } = render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <YouTubeDetails id="jQaeIJOA6J0" open onSelect={jest.fn()} />
      </SWRConfig>
    )
    await waitFor(() =>
      expect(
        getByRole('heading', { name: 'Blessing and Curse' })
      ).toBeInTheDocument()
    )
    expect(
      getByText(
        'Trace the theme of blessing and curse in the Bible to see how Jesus defeats the curse and restores the blessing of life to creation.'
      )
    ).toBeInTheDocument()
    const videoPlayer = getByRole('region', {
      name: 'Video Player'
    })
    const sourceTag = videoPlayer.querySelector('.vjs-tech source')
    expect(sourceTag?.getAttribute('src')).toBe(
      'https://www.youtube.com/watch?v=jQaeIJOA6J0'
    )
    expect(sourceTag?.getAttribute('type')).toBe('video/youtube')
    const imageTag = videoPlayer.querySelector('.vjs-poster > picture > img')
    expect(imageTag?.getAttribute('src')).toBe(
      'https://i.ytimg.com/vi/jQaeIJOA6J0/default.jpg'
    )
  })

  it('should call onSelect on select click', async () => {
    mswServer.use(getVideosWithOffsetAndUrl)
    const onSelect = jest.fn()
    const { getByRole } = render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <YouTubeDetails id="jQaeIJOA6J0" open onSelect={onSelect} />
      </SWRConfig>
    )
    await waitFor(() =>
      expect(
        getByRole('heading', { name: 'Blessing and Curse' })
      ).toBeInTheDocument()
    )
    fireEvent.click(getByRole('button', { name: 'Select' }))
    expect(onSelect).toHaveBeenCalledWith({
      endAt: 363,
      startAt: 0,
      source: VideoBlockSource.youTube,
      videoId: 'jQaeIJOA6J0'
    })
  })
})
