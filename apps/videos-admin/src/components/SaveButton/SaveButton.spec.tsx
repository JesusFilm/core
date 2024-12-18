import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { SaveButton } from './SaveButton'

describe('SaveButton', () => {
  it('should render save button as disabled', () => {
    render(
      <NextIntlClientProvider locale="en">
        <SaveButton disabled />
      </NextIntlClientProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('should render save button as not disabled', () => {
    render(
      <NextIntlClientProvider locale="en">
        <SaveButton disabled={false} />
      </NextIntlClientProvider>
    )

    expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled()
  })
})
