import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { GetAdminVideoVariant } from '../../../../../../../../../libs/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { VariantDialog } from './VariantDialog'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

const variant: GetAdminVideoVariant =
  useAdminVideoMock?.['result']?.['data']['adminVideo']['variants'][0]

describe('VariantDialog', () => {
  it('should show variant information', () => {
    render(
      <NextIntlClientProvider locale="en">
        <VariantDialog variant={variant} open />
      </NextIntlClientProvider>
    )

    expect(
      screen.getByRole('heading', { level: 2, name: 'Munukutuba' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 4, name: 'Downloads' })
    ).toBeInTheDocument()
    expect(screen.getByText('https://arc.gt/4d9ez')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()
  })

  it('should close variant dialog on click', () => {
    const handleClose = jest.fn()

    render(
      <NextIntlClientProvider locale="en">
        <VariantDialog variant={variant} open handleClose={handleClose} />
      </NextIntlClientProvider>
    )

    fireEvent.click(screen.getByTestId('dialog-close-button'))
    expect(handleClose).toHaveBeenCalled()
  })
})