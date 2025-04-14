import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'

import { GetAdminVideoVariant } from '../../../../../../libs/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { VariantDialog } from './page'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

const variant: GetAdminVideoVariant =
  useAdminVideoMock?.['result']?.['data']['adminVideo']['variants'][0]

describe('VariantDialog', () => {
  it('should show variant information', () => {
    render(
      <MockedProvider>
        <VariantDialog variant={variant} open />
      </MockedProvider>
    )

    expect(
      screen.getByRole('heading', { level: 4, name: 'Downloads' })
    ).toBeInTheDocument()
    expect(screen.getByText('https://arc.gt/4d9ez')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()

    const languageDisplay = screen.getByTestId('VariantLanguageDisplay')
    expect(languageDisplay).toHaveTextContent('Munukutuba')
  })

  it('should close variant dialog on click', () => {
    const handleClose = jest.fn()

    render(
      <MockedProvider>
        <VariantDialog variant={variant} open handleClose={handleClose} />
      </MockedProvider>
    )

    fireEvent.click(screen.getByTestId('dialog-close-button'))
    expect(handleClose).toHaveBeenCalled()
  })
})
