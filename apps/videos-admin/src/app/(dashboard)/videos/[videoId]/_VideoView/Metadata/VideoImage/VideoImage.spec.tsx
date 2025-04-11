import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { GetAdminVideo_AdminVideo as AdminVideo } from '../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { VideoImage } from './VideoImage'

interface CloudflareImage {
  id: string
  url?: string | null
  mobileCinematicHigh?: string | null
}

interface ImageAlt {
  id: string
  value?: string | null
}

interface VideoData {
  id: string
  images: CloudflareImage[]
  imageAlt: ImageAlt[]
}

describe('VideoImage', () => {
  const adminVideo: AdminVideo =
    useAdminVideoMock['result']?.['data']?.['adminVideo']

  // Convert AdminVideo to our VideoData type for tests
  const video: VideoData = {
    id: adminVideo.id,
    images: adminVideo.images,
    imageAlt: adminVideo.imageAlt
  }

  it('should show video images', () => {
    render(
      <MockedProvider>
        <VideoImage video={video} />
      </MockedProvider>
    )

    expect(screen.getByText('Banner Image')).toBeInTheDocument()
    expect(screen.getByText('HD Image')).toBeInTheDocument()

    // Check the banner image
    if (video.images.some((img) => img.mobileCinematicHigh)) {
      expect(screen.getByAltText('JESUS')).toBeInTheDocument()
    }
  })

  it('should show edit buttons', () => {
    render(
      <MockedProvider>
        <VideoImage video={video} />
      </MockedProvider>
    )

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })

  it('should show tooltip when hovering over banner edit button', async () => {
    render(
      <MockedProvider>
        <VideoImage video={video} />
      </MockedProvider>
    )

    const bannerButton = screen.getByLabelText('Change banner image')
    fireEvent.mouseOver(bannerButton)
    await waitFor(() =>
      expect(screen.getByText('Change banner image')).toBeInTheDocument()
    )
  })

  it('should show tooltip when hovering over HD edit button', async () => {
    render(
      <MockedProvider>
        <VideoImage video={video} />
      </MockedProvider>
    )

    const hdButton = screen.getByLabelText('Change HD image')
    fireEvent.mouseOver(hdButton)
    await waitFor(() =>
      expect(screen.getByText('Change HD image')).toBeInTheDocument()
    )
  })

  it('should open banner file upload dialog on banner edit button click', async () => {
    render(
      <MockedProvider>
        <VideoImage video={video} />
      </MockedProvider>
    )

    const bannerButton = screen.getByLabelText('Change banner image')
    fireEvent.click(bannerButton)

    await waitFor(() =>
      expect(
        screen.getByTestId('VideoImageUploadDialog-Banner')
      ).toBeInTheDocument()
    )
    expect(
      screen.getByText('Warning: this change will apply immediately')
    ).toBeInTheDocument()
  })

  it('should open HD file upload dialog on HD edit button click', async () => {
    render(
      <MockedProvider>
        <VideoImage video={video} />
      </MockedProvider>
    )

    const hdButton = screen.getByLabelText('Change HD image')
    fireEvent.click(hdButton)

    await waitFor(() =>
      expect(
        screen.getByTestId('VideoImageUploadDialog-HD')
      ).toBeInTheDocument()
    )
    expect(
      screen.getByText('Warning: this change will apply immediately')
    ).toBeInTheDocument()
  })

  it('should close banner file upload dialog on close button click', async () => {
    render(
      <MockedProvider>
        <VideoImage video={video} />
      </MockedProvider>
    )

    const bannerButton = screen.getByLabelText('Change banner image')
    fireEvent.click(bannerButton)

    await waitFor(() =>
      expect(
        screen.getByTestId('VideoImageUploadDialog-Banner')
      ).toBeInTheDocument()
    )

    fireEvent.click(screen.getByTestId('dialog-close-button'))

    await waitFor(() =>
      expect(
        screen.queryByTestId('VideoImageUploadDialog-Banner')
      ).not.toBeInTheDocument()
    )
  })

  it('should close HD file upload dialog on file upload completion', async () => {
    render(
      <MockedProvider>
        <VideoImage video={video} />
      </MockedProvider>
    )

    const hdButton = screen.getByLabelText('Change HD image')
    fireEvent.click(hdButton)

    await waitFor(() =>
      expect(
        screen.getByTestId('VideoImageUploadDialog-HD')
      ).toBeInTheDocument()
    )

    fireEvent.drop(screen.getByTestId('DropZone'))

    await waitFor(() =>
      expect(
        screen.queryByTestId('VideoImageUploadDialog-HD')
      ).not.toBeInTheDocument()
    )
  })

  it('should show fallback if images are empty', () => {
    render(
      <MockedProvider>
        <VideoImage video={{ ...video, images: [] }} />
      </MockedProvider>
    )

    const uploadIcons = screen.getAllByTestId('Upload1Icon')
    expect(uploadIcons.length).toBe(2) // One for banner, one for HD
    expect(screen.getByText('Upload banner image')).toBeInTheDocument()
    expect(screen.getByText('Upload HD image')).toBeInTheDocument()
  })
})
