import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { PublishedChip } from '.'

describe('PublishedChip', () => {
  it('should render published', () => {
    render(
      <NextIntlClientProvider locale="en">
        <PublishedChip published />
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
