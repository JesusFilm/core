import { fireEvent, render } from '@testing-library/react'

import { SnackbarProvider } from 'notistack'
import { videos } from '../Videos/testData'
import { VideoContainerPage } from '.'

const video = videos[0]

describe('VideoContainerPage', () => {
  it('should render SimpleHero', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <VideoContainerPage content={video} />
      </SnackbarProvider>
    )
    expect(getByText(video.title[0].value)).toBeInTheDocument()
  })

  it('should render snippet', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <VideoContainerPage content={video} />
      </SnackbarProvider>
    )
    expect(getByText(video.snippet[0].value)).toBeInTheDocument()
  })

  it('should render share button', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <VideoContainerPage content={video} />
      </SnackbarProvider>
    )
    expect(getByRole('button', { name: 'Share' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Share' }))
    expect(
      getByRole('dialog', { name: 'Share this video' })
    ).toBeInTheDocument()
  })

  xit('should render videos', () => {
    const { getByTestId } = render(
      <SnackbarProvider>
        <VideoContainerPage content={video} />
      </SnackbarProvider>
    )

    expect(getByTestId('videos-grid')).toBeInTheDocument()
  })
})
