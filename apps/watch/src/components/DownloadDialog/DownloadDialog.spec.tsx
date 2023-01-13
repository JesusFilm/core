import { fireEvent, render, waitFor } from '@testing-library/react'
import useDownloader from 'react-use-downloader'

import { VideoContentFields } from '../../../__generated__/VideoContentFields'
import { VideoProvider } from '../../libs/videoContext'

import { videos } from '../Videos/__generated__/testData'
import { DownloadDialog } from './DownloadDialog'

jest.mock('react-use-downloader', () => ({
  __esModule: true,
  default: jest.fn()
}))

const onClose = jest.fn()
const onDownload = jest.fn()
const onCancel = jest.fn()
const video: VideoContentFields = videos[0]

beforeEach(() => {
  const useDownloaderMock = useDownloader as jest.Mock
  useDownloaderMock.mockReturnValue({
    percentage: 75,
    download: onDownload,
    cancel: onCancel,
    isInProgress: false
  })
})

describe('DownloadDialog', () => {
  it('closes the modal and cancels download on cancel icon click', () => {
    const { getByTestId } = render(
      <VideoProvider value={{ content: video }}>
        <DownloadDialog open onClose={onClose} />
      </VideoProvider>
    )
    fireEvent.click(getByTestId('dialog-close-button'))
    expect(onClose).toHaveBeenCalled()
    expect(onCancel).toHaveBeenCalled()
  })

  it('downloads low quality videos', async () => {
    const { getByRole } = render(
      <VideoProvider value={{ content: video }}>
        <DownloadDialog open onClose={onClose} />
      </VideoProvider>
    )

    const downloadButton = getByRole('button', { name: 'Download' })

    expect(downloadButton).toBeDisabled()

    fireEvent.click(getByRole('checkbox'))

    expect(downloadButton).not.toBeDisabled()

    fireEvent.click(getByRole('button', { name: 'Download' }))

    await waitFor(() => {
      expect(onDownload).toBeCalledWith(
        video.variant?.downloads[0].url,
        `${video.title[0].value}.mp4`
      )
    })
  })

  it('downloads high quality videos', async () => {
    const { getByRole } = render(
      <VideoProvider value={{ content: video }}>
        <DownloadDialog open onClose={onClose} />
      </VideoProvider>
    )

    const downloadButton = getByRole('button', { name: 'Download' })

    fireEvent.mouseDown(
      getByRole('button', { name: 'Select a file size Low (197.69 MB)' })
    )
    fireEvent.click(getByRole('option', { name: 'High (2.2 GB)' }), {
      name: 'High'
    })

    fireEvent.click(getByRole('checkbox'))

    expect(downloadButton).not.toBeDisabled()

    fireEvent.click(getByRole('button', { name: 'Download' }))

    await waitFor(() => {
      expect(onDownload).toBeCalledWith(
        video.variant?.downloads[1].url,
        `${video.title[0].value}.mp4`
      )
    })
  })

  it('opens terms of service dialog', async () => {
    const { getByText } = render(
      <VideoProvider value={{ content: video }}>
        <DownloadDialog open onClose={onClose} />
      </VideoProvider>
    )

    fireEvent.click(getByText('Terms of Use'))

    await waitFor(() => {
      expect(getByText('Accept')).toBeInTheDocument()
    })
  })

  it('agrees to terms of use on accept', async () => {
    const { getByText, getByLabelText } = render(
      <VideoProvider value={{ content: video }}>
        <DownloadDialog open onClose={onClose} />
      </VideoProvider>
    )

    fireEvent.click(getByText('Terms of Use'))
    fireEvent.click(getByText('Accept'))

    await waitFor(() => {
      expect(getByLabelText('I agree to the')).toBeChecked()
    })
  })
})
