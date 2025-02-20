import { render, screen } from '@testing-library/react'
import { ReactElement } from 'react'

import { useAdminVideoMock } from '../useAdminVideo/useAdminVideo.mock'

import { VideoProvider, useVideo } from '.'

const baseVideo = useAdminVideoMock.result?.['data']?.['adminVideo']

const VideoConsumer = (): ReactElement => {
  const video = useVideo()

  return <div>{video.id}</div>
}

describe('VideoProvider', () => {
  it('should render', () => {
    render(
      <VideoProvider video={baseVideo}>
        <VideoConsumer />
      </VideoProvider>
    )

    expect(screen.getByText(baseVideo.id)).toBeInTheDocument()
  })
})
