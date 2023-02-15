import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { MockedProvider } from '@apollo/client/testing'
import { videos } from '../Videos/__generated__/testData'
import { VideoProvider } from '../../libs/videoContext'
import { getVideoChildrenMock } from '../../libs/useVideoChildren/getVideoChildrenMock'
import { VideoContentPage } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('VideoContentPage', () => {
  it('should render VideoHero', () => {
    const { getAllByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <VideoContentPage />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getAllByRole('button', { name: 'Play' })).toHaveLength(1)
  })

  it('should render description', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <VideoContentPage />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('tab', { name: 'Description' })).toBeInTheDocument()
  })

  it('should render children', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[getVideoChildrenMock]}>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <VideoContentPage />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(getByRole('heading', { name: 'Magdalena' })).toBeInTheDocument()
    )
  })

  it('should render share button', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <VideoContentPage />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Share' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Share' }))
    expect(
      getByRole('dialog', { name: 'Share this video' })
    ).toBeInTheDocument()
  })

  it('should render download button', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <VideoContentPage />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Download' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Download' }))
    expect(getByRole('dialog', { name: 'Download Video' })).toBeInTheDocument()
  })
})
