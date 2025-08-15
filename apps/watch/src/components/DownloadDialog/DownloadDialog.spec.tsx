import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import useDownloader from 'react-use-downloader'

import {
  VideoContentFields_variant as Variant,
  VideoContentFields
} from '../../../__generated__/VideoContentFields'
import { VideoProvider } from '../../libs/videoContext'
import { videos } from '../Videos/__generated__/testData'

import { DownloadDialog } from './DownloadDialog'

jest.mock('react-use-downloader', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('DownloadDialog', () => {
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
      expect(onDownload).toHaveBeenCalledWith(
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

    fireEvent.mouseDown(getByRole('combobox'))
    fireEvent.click(getByRole('option', { name: 'High (2.2 GB)' }), {
      name: 'High'
    })

    fireEvent.click(getByRole('checkbox'))

    expect(downloadButton).not.toBeDisabled()

    fireEvent.click(getByRole('button', { name: 'Download' }))

    await waitFor(() => {
      expect(onDownload).toHaveBeenCalledWith(
        video.variant?.downloads[0].url,
        `${video.title[0].value}.mp4`
      )
    })
  })

  it('should display error message when no downloads', async () => {
    const noDownloadsVideo = {
      ...video,
      variant: {
        ...video.variant,
        downloads: []
      } as unknown as Variant
    }
    render(
      <VideoProvider value={{ content: noDownloadsVideo }}>
        <DownloadDialog open onClose={onClose} />
      </VideoProvider>
    )
    await waitFor(() =>
      expect(screen.getByText('No Downloads Available')).toBeInTheDocument()
    )
  })

  it('changes checkbox when submit or close', async () => {
    const { getByText, getByLabelText, queryByText } = render(
      <VideoProvider value={{ content: video }}>
        <DownloadDialog open onClose={onClose} />
      </VideoProvider>
    )
    fireEvent.click(getByText('Terms of Use'))
    fireEvent.click(getByText('Accept'))
    await waitFor(() => expect(queryByText('Accept')).not.toBeInTheDocument())
    expect(getByLabelText('I agree to the')).toBeChecked()
    fireEvent.click(getByText('Terms of Use'))
    fireEvent.click(getByText('Cancel'))
    await waitFor(() => expect(queryByText('Cancel')).not.toBeInTheDocument())
    expect(getByLabelText('I agree to the')).not.toBeChecked()
  })
})
