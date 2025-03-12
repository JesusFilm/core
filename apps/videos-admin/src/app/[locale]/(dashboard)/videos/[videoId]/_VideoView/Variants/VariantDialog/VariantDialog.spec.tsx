import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { GetAdminVideoVariant } from '../../../../../../../../libs/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { VariantDialog } from './VariantDialog'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

const variant: GetAdminVideoVariant =
  useAdminVideoMock?.['result']?.['data']['adminVideo']['variants'][0]

// english variant
const variant2: GetAdminVideoVariant =
  useAdminVideoMock?.['result']?.['data']['adminVideo']['variants'][2]

const mockVariantLanguages = new Map([
  [variant.language.id, variant],
  [variant2.language.id, variant2]
])

describe('VariantDialog', () => {
  it('should show variant information', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <VariantDialog
            variant={variant}
            open
            variantLanguagesMap={mockVariantLanguages}
          />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(
      screen.getByRole('heading', { level: 4, name: 'Downloads' })
    ).toBeInTheDocument()
    expect(screen.getByText('https://arc.gt/4d9ez')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()

    // Check that the language is displayed correctly
    const languageDisplay = screen.getByTestId('VariantLanguageDisplay')
    expect(languageDisplay).toHaveTextContent('Munukutuba')
  })

  it('should close variant dialog on click', () => {
    const handleClose = jest.fn()

    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <VariantDialog
            variant={variant}
            open
            handleClose={handleClose}
            variantLanguagesMap={mockVariantLanguages}
          />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    fireEvent.click(screen.getByTestId('dialog-close-button'))
    expect(handleClose).toHaveBeenCalled()
  })
})
