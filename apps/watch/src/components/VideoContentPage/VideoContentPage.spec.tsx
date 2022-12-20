import { fireEvent, render } from '@testing-library/react'

import { SnackbarProvider } from 'notistack'
import { VideoContentFields } from '../../../__generated__/VideoContentFields'
import { VideoProvider } from '../../libs/videoContext'
import { videos } from '../Videos/testData'
import { VideoContentPage } from '.'

const video: VideoContentFields = { ...videos[0] }

describe('VideoContentPage', () => {
  it('should render VideoHero', () => {
    const { getAllByRole } = render(
      <SnackbarProvider>
        <VideoProvider value={{ content: video }}>
          <VideoContentPage />
        </VideoProvider>
      </SnackbarProvider>
    )

    expect(getAllByRole('button', { name: 'Play' })).toHaveLength(1)
  })

  it('should render description', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <VideoProvider value={{ content: video }}>
          <VideoContentPage />
        </VideoProvider>
      </SnackbarProvider>
    )
    expect(getByRole('tab', { name: 'Description' })).toBeInTheDocument()
  })

  it('should render related videos', () => {
    const { getByTestId } = render(
      <SnackbarProvider>
        <VideoProvider value={{ content: video }}>
          <VideoContentPage />
        </VideoProvider>
      </SnackbarProvider>
    )

    expect(getByTestId('videos-carousel')).toBeInTheDocument()
  })

  it('should render share button', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <VideoProvider value={{ content: video }}>
          <VideoContentPage />
        </VideoProvider>
      </SnackbarProvider>
    )
    expect(getByRole('button', { name: 'Share' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Share' }))
    expect(
      getByRole('dialog', { name: 'Share this video' })
    ).toBeInTheDocument()
  })
})
