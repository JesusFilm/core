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
    const useDownloaderMock = useDownloader as jest.MockedFunction<
      typeof useDownloader
    >
    useDownloaderMock.mockReturnValue({
      percentage: 75,
      download: onDownload,
      cancel: onCancel,
      isInProgress: false,
      size: 100,
      elapsed: 0,
      error: null
    })
  })

  const renderDialog = (dialogVideo: VideoContentFields = video) =>
    render(
      <VideoProvider value={{ content: dialogVideo }}>
        <DownloadDialog open onClose={onClose} />
      </VideoProvider>
    )

  it('closes the modal and cancels download on cancel icon click', () => {
    const { getByTestId } = renderDialog()

    fireEvent.click(getByTestId('dialog-close-button'))
    expect(onClose).toHaveBeenCalled()
    expect(onCancel).toHaveBeenCalled()
  })

  it('downloads selected videos after accepting terms', async () => {
    renderDialog()

    const downloadButton = screen.getByRole('button', { name: 'Download' })

    expect(downloadButton).toBeDisabled()

    fireEvent.click(screen.getByLabelText('I agree to the'))

    expect(downloadButton).not.toBeDisabled()

    fireEvent.click(downloadButton)

    await waitFor(() => {
      expect(onDownload).toHaveBeenCalledWith(
        video.variant?.downloads[0].url,
        `${video.title[0].value}.mp4`
      )
    })
  })

  it('downloads a different quality when selected', async () => {
    renderDialog()

    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByRole('option', { name: /Low/ }))

    fireEvent.click(screen.getByLabelText('I agree to the'))
    fireEvent.click(screen.getByRole('button', { name: 'Download' }))

    await waitFor(() => {
      expect(onDownload).toHaveBeenCalledWith(
        video.variant?.downloads[1].url,
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
    renderDialog(noDownloadsVideo)
    await waitFor(() =>
      expect(
        screen.getByText('No Downloads Available', { selector: 'p' })
      ).toBeInTheDocument()
    )
  })

  it('changes checkbox when submit or close', async () => {
    renderDialog()
    fireEvent.click(screen.getByText('Terms of Use'))
    fireEvent.click(screen.getByText('Accept'))
    await waitFor(() =>
      expect(screen.queryByText('Accept')).not.toBeInTheDocument()
    )
    expect(screen.getByLabelText('I agree to the')).toBeChecked()
    fireEvent.click(screen.getByText('Terms of Use'))
    fireEvent.click(screen.getByText('Cancel'))
    await waitFor(() =>
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
    )
    expect(screen.getByLabelText('I agree to the')).not.toBeChecked()
  })

  it('should render Mux stream URLs as direct links instead of form submissions', () => {
    const muxVideo = {
      ...video,
      variant: {
        ...video.variant,
        downloads: [
          {
            ...video.variant?.downloads[0],
            url: 'https://stream.mux.com/test-url'
          }
        ]
      }
    } as VideoContentFields

    renderDialog(muxVideo)

    const termsCheckbox = screen.getByLabelText('I agree to the')
    fireEvent.click(termsCheckbox)

    const downloadButton = screen.getByRole('link', { name: 'Download' })
    expect(downloadButton).toHaveAttribute('href')
  })

  it('should render regular URLs as button downloads', () => {
    const regularVideo = {
      ...video,
      variant: {
        ...video.variant,
        downloads: [
          {
            ...video.variant?.downloads[0],
            url: 'https://example.com/video.mp4'
          }
        ]
      }
    } as VideoContentFields

    renderDialog(regularVideo)

    const termsCheckbox = screen.getByLabelText('I agree to the')
    fireEvent.click(termsCheckbox)

    const downloadButton = screen.getByRole('button', { name: 'Download' })
    expect(downloadButton).not.toHaveAttribute('href')
  })

  it('should display download quality options in correct order (highest, high, low)', () => {
    renderDialog()

    fireEvent.click(screen.getByRole('combobox'))

    const options = screen.getAllByRole('option')
    const optionTexts = options.map((option) => option.textContent)

    expect(optionTexts[0]).toContain('High')
    expect(optionTexts[1]).toContain('Low')
  })
})
