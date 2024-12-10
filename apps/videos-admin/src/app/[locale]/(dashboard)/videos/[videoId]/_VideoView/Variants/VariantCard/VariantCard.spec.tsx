import { fireEvent, render, screen, waitFor } from '@testing-library/react'
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
  it('should display language and languageId of variant', () => {
    render(
      <NextIntlClientProvider locale="en">
        <VariantCard variant={variant} />
      </NextIntlClientProvider>
    )

    expect(screen.getByText('Munukutuba')).toBeInTheDocument()
  })

  it('should open variant dialog on click', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <VariantCard variant={variant} />
      </NextIntlClientProvider>
    )

    fireEvent.click(screen.getByRole('listitem'))
    await waitFor(() =>
      expect(screen.getByText('Downloads')).toBeInTheDocument()
    )
  })
})
