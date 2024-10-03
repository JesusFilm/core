import { render, screen } from '@testing-library/react'
import { PublishedChip } from '.'
import { NextIntlClientProvider } from 'next-intl'

describe('PublishedChip', () => {
  it('should render published', () => {
    render(
      <NextIntlClientProvider locale="en">
        <PublishedChip published={true} />
      </NextIntlClientProvider>
    )

    expect(screen.getByText('Published')).toBeInTheDocument()
  })

  it('should render unpublished', () => {
    render(
      <NextIntlClientProvider locale="en">
        <PublishedChip published={false} />
      </NextIntlClientProvider>
    )

    expect(screen.getByText('Unpublished')).toBeInTheDocument()
  })
})
