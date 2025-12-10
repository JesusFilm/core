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

    render(
      <VideoProvider value={{ content: muxVideo }}>
        <DownloadDialog open onClose={onClose} />
      </VideoProvider>
    )

    const termsCheckbox = screen.getByRole('checkbox')
    fireEvent.click(termsCheckbox)

    // For Mux streams, should show download button with href attribute (direct link)
    const downloadButton = screen.getByRole('link', { name: 'Download' })
    expect(downloadButton).toHaveAttribute('href')
    expect(downloadButton).not.toHaveAttribute('type', 'submit')
  })

  it('should render regular URLs as form submissions', () => {
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

    render(
      <VideoProvider value={{ content: regularVideo }}>
        <DownloadDialog open onClose={onClose} />
      </VideoProvider>
    )

    const termsCheckbox = screen.getByRole('checkbox')
    fireEvent.click(termsCheckbox)

    // For regular URLs, should show submit button (form submission)
    const downloadButton = screen.getByRole('button', { name: 'Download' })
    expect(downloadButton).toHaveAttribute('type', 'submit')
    expect(downloadButton).not.toHaveAttribute('href')
  })

  it('should display download quality options in correct order (highest, high, low)', () => {
    render(
      <VideoProvider value={{ content: video }}>
        <DownloadDialog open onClose={onClose} />
      </VideoProvider>
    )

    const qualitySelect = screen.getByRole('combobox')
    fireEvent.mouseDown(qualitySelect)

    const options = screen.getAllByRole('option')
    const optionTexts = options.map((option) => option.textContent)

    // Should be ordered: Highest, High, Low
    expect(optionTexts[0]).toContain('High (2.2 GB)')
    expect(optionTexts[1]).toContain('Low (197.55 MB)')
  })
})
