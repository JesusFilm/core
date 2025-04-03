import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { GetAdminVideo_AdminVideo as AdminVideo } from '../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { VideoImage } from './VideoImage'

describe('VideoImage', () => {
  const video: AdminVideo =
    useAdminVideoMock['result']?.['data']?.['adminVideo']

  it('should show video image', () => {
    render(
      <MockedProvider>
        <VideoImage video={video} />
      </MockedProvider>
    )

    expect(screen.getByAltText('JESUS')).toBeInTheDocument()
  })

  it('should show edit button', () => {
    render(
      <MockedProvider>
        <VideoImage video={video} />
      </MockedProvider>
    )

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should show tooltip when hovering over edit button', async () => {
    render(
      <MockedProvider>
        <VideoImage video={video} />
      </MockedProvider>
    )

    fireEvent.mouseOver(screen.getByRole('button'))
    await waitFor(() =>
      expect(screen.getByText('Change image')).toBeInTheDocument()
    )
  })

  it('should open file upload dialog on edit button click', async () => {
    render(
      <MockedProvider>
        <VideoImage video={video} />
      </MockedProvider>
    )
    expect(screen.getByRole('button')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() =>
      expect(screen.getByTestId('VideoImageUploadDialog')).toBeInTheDocument()
    )
    expect(
      screen.getByText('Warning: this change will apply immediately')
    ).toBeInTheDocument()
  })

  it('should close file upload dialog on close button click', async () => {
    render(
      <MockedProvider>
        <VideoImage video={video} />
      </MockedProvider>
    )
    expect(screen.getByRole('button')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() =>
      expect(screen.getByTestId('VideoImageUploadDialog')).toBeInTheDocument()
    )
    fireEvent.click(screen.getByTestId('dialog-close-button'))
    await waitFor(() =>
      expect(
        screen.queryByTestId('VideoImageUploadDialog')
      ).not.toBeInTheDocument()
    )
  })

  it('should close file upload on file upload completion', async () => {
    render(
      <MockedProvider>
        <VideoImage video={video} />
      </MockedProvider>
    )
    expect(screen.getByRole('button')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() =>
      expect(screen.getByTestId('VideoImageUploadDialog')).toBeInTheDocument()
    )
    fireEvent.drop(screen.getByTestId('DropZone'))
    await waitFor(() =>
      expect(
        screen.queryByTestId('VideoImageUploadDialog')
      ).not.toBeInTheDocument()
    )
  })

  it('should show fallback if src is null', () => {
    render(
      <MockedProvider>
        <VideoImage video={{ ...video, images: [] }} />
      </MockedProvider>
    )

    expect(screen.getByTestId('Upload1Icon')).toBeInTheDocument()
    expect(screen.getByText('Upload image')).toBeInTheDocument()
  })
})
