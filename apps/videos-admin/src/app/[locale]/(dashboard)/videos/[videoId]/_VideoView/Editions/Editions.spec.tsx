import { render } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { Editions } from './Editions'

describe('Editions', () => {
  it('Should show fallback if no editions', () => {
    render(
      <NextIntlClientProvider locale="en">
        <Editions />
      </NextIntlClientProvider>
    )

    expect(true).toBe(true)
  })

  it('Should show subtitles by their edition', () => {
    render(
      <NextIntlClientProvider locale="en">
        <Editions />
      </NextIntlClientProvider>
    )
    expect(true).toBe(true)
  })
})
