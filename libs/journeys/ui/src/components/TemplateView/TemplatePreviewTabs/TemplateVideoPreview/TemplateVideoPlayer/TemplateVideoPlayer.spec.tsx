import { render } from '@testing-library/react'

import { VideoBlockSource } from '../../../../../../__generated__/globalTypes'

import { TemplateVideoPlayer } from './TemplateVideoPlayer'

describe('TemplateVideoPlayer', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    process.env = { NODE_ENV: 'test' }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('should render internal videos', async () => {
    const { getByTestId } = render(
      <TemplateVideoPlayer
        id="https://arc.gt/hls/2_0-FallingPlates/529"
        source={VideoBlockSource.internal}
        startAt={1000}
        endAt={4000}
      />
    )

    expect(
      getByTestId(
        'TemplateVideoPlayer-https://arc.gt/hls/2_0-FallingPlates/529'
      ).querySelector('source')
    ).toHaveAttribute('src', 'https://arc.gt/hls/2_0-FallingPlates/529')
  })

  it('should render mux videos', async () => {
    const { getByTestId } = render(
      <TemplateVideoPlayer
        id="someMuxId"
        source={VideoBlockSource.mux}
        startAt={1000}
        endAt={4000}
      />
    )

    expect(
      getByTestId('TemplateVideoPlayer-someMuxId').querySelector('source')
    ).toHaveAttribute(
      'src',
      'https://customer-mock-customer-code.cloudflarestream.com/someCloudflareId/manifest/video.m3u8'
    )
  })

  it('should render youtube videos', async () => {
    const { getByTestId } = render(
      <TemplateVideoPlayer
        id="someYTId"
        source={VideoBlockSource.youTube}
        startAt={1000}
        endAt={4000}
      />
    )

    expect(
      getByTestId('TemplateVideoPlayer-someYTId').querySelector('source')
    ).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/someYTId?start=1000&end=4000'
    )
  })
})
