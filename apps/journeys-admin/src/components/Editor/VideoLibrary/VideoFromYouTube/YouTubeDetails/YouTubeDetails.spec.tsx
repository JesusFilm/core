import { render, fireEvent, waitFor } from '@testing-library/react'
import { SWRConfig } from 'swr'
import { VideoBlockSource } from '../../../../../../__generated__/globalTypes'
import { mswServer } from '../../../../../../test/mswServer'
import {
  getVideosWithOffsetAndUrl,
  getVideoWithLongDescription
} from '../VideoFromYouTube.handlers'
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
    expect(sourceTag?.getAttribute('src')).toEqual(
      'https://www.youtube.com/watch?v=jQaeIJOA6J0'
    )
    expect(sourceTag?.getAttribute('type')).toEqual('video/youtube')
    const imageTag = videoPlayer.querySelector('.vjs-poster')
    expect(imageTag).toHaveStyle(
      "background-image: url('https://i.ytimg.com/vi/jQaeIJOA6J0/default.jpg')"
    )
  })

  it('should not render show more or show less buttons for short video descriptions', async () => {
    mswServer.use(getVideosWithOffsetAndUrl)
    const { queryByRole } = render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <YouTubeDetails id="jQaeIJOA6J0" open onSelect={jest.fn()} />
      </SWRConfig>
    )
    await waitFor(() =>
      expect(queryByRole('button', { name: 'More' })).not.toBeInTheDocument()
    )
  })

  it('should expand and truncate video description on button click', async () => {
    mswServer.use(getVideoWithLongDescription)

    const longVideoDescription =
      'Trace the theme of blessing and curse in the Bible to see how Jesus defeats the curse of sin that entered through Adam and restores the blessing of life to creation to what it once was like in the Garden of Eden.'

    const { queryByRole, getByRole, getByText, queryByText } = render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <YouTubeDetails id="jQaeIJOA6J0" open onSelect={jest.fn()} />
      </SWRConfig>
    )

    await waitFor(() =>
      expect(getByRole('button', { name: 'More' })).toBeInTheDocument()
    )
    fireEvent.click(getByRole('button', { name: 'More' }))
    expect(queryByRole('button', { name: 'Less' })).toBeInTheDocument()
    expect(getByText(longVideoDescription)).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Less' }))
    expect(getByRole('button', { name: 'More' })).toBeInTheDocument()
    expect(queryByText(longVideoDescription)).not.toBeInTheDocument()
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
