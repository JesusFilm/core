import { render } from '@testing-library/react'

import { MuxDetails } from './MuxDetails'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('CloudflareDetails', () => {
  it('should render details of a video', async () => {
    const { getByRole } = render(
      <MuxDetails id="videoId" open onSelect={jest.fn()} />
    )
    const videoPlayer = getByRole('region', {
      name: 'Video Player'
    })
    const sourceTag = videoPlayer.querySelector('.vjs-tech source')
    expect(sourceTag?.getAttribute('src')).toMatch(
      /^https:\/\/customer-.*\.cloudflarestream\.com\/videoId\/manifest\/video\.m3u8$/
    )
    expect(sourceTag?.getAttribute('type')).toBe('application/x-mpegURL')
    const imageTag = videoPlayer.querySelector('.vjs-poster > picture > img')
    expect(imageTag?.getAttribute('src')).toMatch(
      /https:\/\/customer-.*\.cloudflarestream\.com\/videoId\/thumbnails\/thumbnail\.jpg\?time=2s/
    )
  })
})
