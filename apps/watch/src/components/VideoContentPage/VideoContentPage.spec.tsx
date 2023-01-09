import { fireEvent, getByTestId, render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { videos } from '../Videos/testData'
import { VideoProvider } from '../../libs/videoContext'
import { VideoContentPage } from '.'

describe('VideoContentPage', () => {
  it('should render VideoHero', () => {
    const { getAllByRole } = render(
      <SnackbarProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <VideoContentPage />
        </VideoProvider>
      </SnackbarProvider>
    )

    expect(getAllByRole('button', { name: 'Play' })).toHaveLength(1)
  })

  it('should render description', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <VideoContentPage />
        </VideoProvider>
      </SnackbarProvider>
    )
    expect(getByRole('tab', { name: 'Description' })).toBeInTheDocument()
  })

  it('should render related videos', () => {
    const { getByTestId } = render(
      <SnackbarProvider>
        <VideoProvider value={{ content: videos[2], container: videos[0] }}>
          <VideoContentPage />
        </VideoProvider>
      </SnackbarProvider>
    )

    expect(getByTestId('videos-carousel')).toBeInTheDocument()
  })

  it('should render title on feature films', () => {
    const { getByTestId } = render(
      <SnackbarProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <VideoContentPage />
        </VideoProvider>
      </SnackbarProvider>
    )

    expect(getByTestId('title')).toBeInTheDocument()
  })

  it('should not render title if item is not a feature film', () => {
    const { queryByTestId } = render(
      <SnackbarProvider>
        <VideoProvider value={{ content: videos[2] }}>
          <VideoContentPage />
        </VideoProvider>
      </SnackbarProvider>
    )

    expect(queryByTestId('title')).toBeNull()
  })

  it('should render share button', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <VideoProvider value={{ content: videos[0] }}>
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

  it('should render download button', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <VideoContentPage />
        </VideoProvider>
      </SnackbarProvider>
    )
    expect(getByRole('button', { name: 'Download' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Download' }))
    expect(getByRole('dialog', { name: 'Download Video' })).toBeInTheDocument()
  })
})
