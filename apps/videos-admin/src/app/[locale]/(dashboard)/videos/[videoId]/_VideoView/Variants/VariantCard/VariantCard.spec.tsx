import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { GetAdminVideoVariant } from '../../../../../../../../libs/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { VariantCard } from './VariantCard'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

const variant: GetAdminVideoVariant =
  useAdminVideoMock?.['result']?.['data']['adminVideo']['variants'][0]

describe('VariantCard', () => {
  it('should display language and slug of variant', () => {
    render(
      <NextIntlClientProvider locale="en">
        <VariantCard variant={variant} />
      </NextIntlClientProvider>
    )

    expect(screen.getByText('Munukutuba')).toBeInTheDocument()
    expect(screen.getByText('jesus/munukutuba')).toBeInTheDocument()
  })

  it('should open variant dialog on click', () => {
    render(
      <NextIntlClientProvider locale="en">
        <VariantCard variant={variant} />
      </NextIntlClientProvider>
    )

    fireEvent.click(screen.getByText('Munukutuba'))

    expect(screen.getByText('Variant')).toBeInTheDocument()
    expect(screen.getByText('Slug')).toBeInTheDocument()
  })
})
