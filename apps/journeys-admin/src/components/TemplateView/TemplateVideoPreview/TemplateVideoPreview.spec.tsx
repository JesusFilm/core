import { fireEvent, getByTestId, render, waitFor } from '@testing-library/react'
import { TemplateVideoPreview } from './TemplateVideoPreview'
import { VideoBlockSource } from '../../../../__generated__/globalTypes'

describe('TemplateVideoPreview', () => {
  it('should render internal video', async () => {
    const { getByRole, getByTestId } = render(
      <TemplateVideoPreview
        id="https://arc.gt/opsgn"
        source={VideoBlockSource.internal}
        poster="imageURL"
      />
    )

    const videoPlayer = getByRole('region', {
      name: 'Video Player'
    })
    const sourceTag = videoPlayer.querySelector('.vjs-tech source')
    expect(sourceTag?.getAttribute('src')).toBe('https://arc.gt/opsgn')
    expect(sourceTag?.getAttribute('type')).toBe('application/x-mpegURL')
    const imageTag = videoPlayer.querySelector('.vjs-poster > picture > img')
    expect(imageTag?.getAttribute('src')).toBe('imageURL')
  })

  it('should render cloudflare videos', async () => {
    const { getByRole, getByTestId } = render(
      <TemplateVideoPreview
        id="some-id-from-cloudFlare"
        source={VideoBlockSource.cloudflare}
        poster="imageURL"
      />
    )

    const videoPlayer = getByRole('region', {
      name: 'Video Player'
    })
    const sourceTag = videoPlayer.querySelector('.vjs-tech source')
    expect(sourceTag?.getAttribute('src')).toBe(
      'https://customer-.cloudflarestream.com/some-id-from-cloudFlare/manifest/video.m3u8'
    )
    expect(sourceTag?.getAttribute('type')).toBe('application/x-mpegURL')
    const imageTag = videoPlayer.querySelector('.vjs-poster > picture > img')
    expect(imageTag?.getAttribute('src')).toBe('imageURL')
  })

  it('should render youTube video', async () => {
    const { getByRole, getByTestId } = render(
      <TemplateVideoPreview
        id="sOm3iD"
        source={VideoBlockSource.youTube}
        poster="imageURL-YT"
      />
    )

    const videoPlayer = getByRole('region', {
      name: 'Video Player'
    })
    const sourceTag = videoPlayer.querySelector('.vjs-tech source')
    expect(sourceTag?.getAttribute('src')).toBe(
      'https://www.youtube.com/embed/sOm3iD'
    )
    expect(sourceTag?.getAttribute('type')).toBe('video/youtube')
    const imageTag = videoPlayer.querySelector('.vjs-poster > picture > img')
    expect(imageTag?.getAttribute('src')).toBe('imageURL-YT')
  })
})
