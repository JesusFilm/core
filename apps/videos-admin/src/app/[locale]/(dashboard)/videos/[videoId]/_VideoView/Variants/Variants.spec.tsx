import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { SnackbarProvider } from 'notistack'

import { UploadVideoVariantProvider } from '../../../../../../../libs/UploadVideoVariantProvider'
import { GetAdminVideoVariant as VideoVariants } from '../../../../../../../libs/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { DELETE_VIDEO_VARIANT } from '../../../../../../../libs/useDeleteVideoVariantMutation'

import { Variants } from './Variants'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => false
}))

jest.mock('next/navigation', () => ({
  useParams: () => ({ videoId: 'video123' })
}))

describe('Variants', () => {
  const mockVideoVariants: VideoVariants[] =
    useAdminVideoMock['result']?.['data']?.['adminVideo']?.['variants']

  it('should render variants', () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <Variants variants={mockVideoVariants} />
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('should open variant modal when variant is clicked', async () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <Variants variants={mockVideoVariants} />
        </NextIntlClientProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getAllByRole('listitem')[0])
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 4, name: 'Downloads' })
      ).toBeInTheDocument()
    )
  })

  it('should close variant modal', async () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <Variants variants={mockVideoVariants} />
        </NextIntlClientProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getAllByRole('listitem')[0])
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 4, name: 'Downloads' })
      ).toBeInTheDocument()
    )
    const backdrop = document.querySelector('.MuiBackdrop-root')
    if (backdrop) {
      fireEvent.click(backdrop)
    }
    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { level: 4, name: 'Downloads' })
      ).not.toBeInTheDocument()
    )
  })

  it('should have correct id for the Section element so correct virtualization dimensions can be calculated', async () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <Variants variants={mockVideoVariants} />
        </NextIntlClientProvider>
      </MockedProvider>
    )

    const section = document.getElementById('Audio Languages-section')
    expect(section).toBeInTheDocument()
  })

  it('should open and close delete confirmation dialog', async () => {
    const deleteMutationMock = {
      request: {
        query: DELETE_VIDEO_VARIANT,
        variables: {
          id: mockVideoVariants[0].id
        }
      },
      result: {
        data: {
          videoVariantDelete: {
            id: mockVideoVariants[0].id,
            videoId: mockVideoVariants[0].videoId
          }
        }
      }
    }

    render(
      <MockedProvider mocks={[deleteMutationMock]}>
        <NextIntlClientProvider locale="en">
          <SnackbarProvider>
            <Variants variants={mockVideoVariants} />
          </SnackbarProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    const deleteButtons = screen.getAllByLabelText('delete variant')
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Delete Audio Language')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Cancel'))

    await waitFor(() => {
      expect(
        screen.queryByText('Delete Audio Language')
      ).not.toBeInTheDocument()
    })
  })

  it('should open add audio language dialog when clicking add audio language button', async () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <UploadVideoVariantProvider>
            <Variants variants={mockVideoVariants} />
          </UploadVideoVariantProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByText('Add Audio Language'))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
  })

  it('should close add audio language dialog', async () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <UploadVideoVariantProvider>
            <Variants variants={mockVideoVariants} />
          </UploadVideoVariantProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByText('Add Audio Language'))

    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())

    const backdrop = document.querySelector('.MuiBackdrop-root')
    if (backdrop) {
      fireEvent.click(backdrop)
    }

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )
  })
})
