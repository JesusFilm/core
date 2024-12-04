import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { GetAdminVideoVariant as VideoVariants } from '../../../../../../../libs/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { Variants } from './Variants'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => false
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

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
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
})
