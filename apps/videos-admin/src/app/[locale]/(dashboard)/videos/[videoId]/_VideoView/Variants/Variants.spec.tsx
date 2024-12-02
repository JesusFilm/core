import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { GetAdminVideoVariant as VideoVariants } from '../../../../../../../libs/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { EditProvider } from '../../_EditProvider'

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
          <EditProvider>
            <Variants variants={mockVideoVariants} />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(
      screen.getByRole('button', { name: 'Munukutuba 4334' })
    ).toBeInTheDocument()
  })

  it('should open variant modal when variant is clicked', () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <EditProvider>
            <Variants variants={mockVideoVariants} />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Munukutuba 4334' }))
    expect(
      screen.getByRole('heading', { level: 4, name: 'Downloads' })
    ).toBeInTheDocument()
  })

  it('should close variant modal', async () => {
    render(
      <MockedProvider>
        <NextIntlClientProvider locale="en">
          <EditProvider>
            <Variants variants={mockVideoVariants} />
          </EditProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Munukutuba 4334' }))
    expect(
      screen.getByRole('heading', { level: 4, name: 'Downloads' })
    ).toBeInTheDocument()
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
