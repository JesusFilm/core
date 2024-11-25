import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { GetAdminVideoVariant } from '../../../../../../../../libs/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { VariantCard } from './VariantCard'

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

  it('should handle onClick', () => {
    const mockOnClick = jest.fn()

    render(
      <NextIntlClientProvider locale="en">
        <VariantCard variant={variant} onClick={mockOnClick} />
      </NextIntlClientProvider>
    )
    fireEvent.click(screen.getByRole('button'))
    expect(mockOnClick).toHaveBeenCalled()
  })
})
