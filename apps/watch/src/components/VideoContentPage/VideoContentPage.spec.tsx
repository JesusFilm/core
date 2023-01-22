import { fireEvent, render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { videos } from '../Videos/__generated__/testData'
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
    const { getByRole, getByTestId } = render(
      <SnackbarProvider>
        <VideoProvider
          value={{
            content: videos[14],
            container: {
              ...videos[13],
              children: [...videos[13].children, videos[14]],
              childrenCount: videos[13].childrenCount + 1
            }
          }}
        >
          <VideoContentPage />
        </VideoProvider>
      </SnackbarProvider>
    )

    expect(getByTestId('videos-carousel')).toBeInTheDocument()
    expect(
      getByRole('heading', { name: 'LUMO - Luke 1:1-56' })
    ).toBeInTheDocument()
  })

  it('should render title on feature films', () => {
    const { getByRole, getByTestId } = render(
      <SnackbarProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <VideoContentPage />
        </VideoProvider>
      </SnackbarProvider>
    )

    expect(getByRole('heading', { name: 'JESUS Scenes' })).toBeInTheDocument()
    expect(getByTestId('videos-carousel')).toBeInTheDocument()
    expect(getByRole('heading', { name: 'The Beginning' })).toBeInTheDocument()
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
