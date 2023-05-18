import { render, fireEvent, waitFor } from '@testing-library/react'
import { CloudflareDetails } from './CloudflareDetails'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('CloudflareDetails', () => {
  it('should render details of a video', async () => {
    const { getByRole } = render(
      <CloudflareDetails id="videoId" open onSelect={jest.fn()} />
    )
    const videoPlayer = getByRole('region', {
      name: 'Video Player'
    })
    const sourceTag = videoPlayer.querySelector('.vjs-tech source')
    expect(sourceTag?.getAttribute('src')).toEqual(
      'https://customer-.cloudflarestream.com/videoId/manifest/video.m3u8'
    )
    expect(sourceTag?.getAttribute('type')).toEqual('application/x-mpegURL')
    const imageTag = videoPlayer.querySelector('.vjs-poster')
    expect(imageTag).toHaveStyle(
      "background-image: url('https://customer-.cloudflarestream.com/videoId/thumbnails/thumbnail.jpg?time=2s')"
    )
  })

  it('should call onSelect on select click', async () => {
    const onSelect = jest.fn()
    const { getByRole } = render(
      <CloudflareDetails id="2_Acts7302-0-0" open onSelect={onSelect} />
    )
    await waitFor(() =>
      expect(getByRole('button', { name: 'Select' })).toBeEnabled()
    )
    fireEvent.click(getByRole('button', { name: 'Select' }))
    expect(onSelect).toHaveBeenCalledWith({})
  })
})
