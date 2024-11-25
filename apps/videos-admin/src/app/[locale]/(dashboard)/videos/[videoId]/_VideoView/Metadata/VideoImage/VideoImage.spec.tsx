import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { GetAdminVideo_AdminVideo as AdminVideo } from '../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { NextIntlClientProvider } from 'next-intl'
import { MockedProvider } from '@apollo/client/testing'
import { VideoImage } from './VideoImage'

describe('VideoImage', () => {
  const video: AdminVideo =
    useAdminVideoMock['result']?.['data']?.['adminVideo']

  it('should show video image', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <VideoImage video={video} isEdit={false} />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByAltText('JESUS')).toBeInTheDocument()
  })

  it('should show edit button when editable', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <VideoImage video={video} isEdit={true} />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should open file upload dialog on edit button click', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <VideoImage video={video} isEdit={true} />
        </MockedProvider>
      </NextIntlClientProvider>
    )
    expect(screen.getByRole('button')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() =>
      expect(screen.getByTestId('VideoImageUploadDialog')).toBeInTheDocument()
    )
  })

  it('should close file upload dialog on close button click', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <VideoImage video={video} isEdit={true} />
        </MockedProvider>
      </NextIntlClientProvider>
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
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <VideoImage video={video} isEdit={true} />
        </MockedProvider>
      </NextIntlClientProvider>
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
})
