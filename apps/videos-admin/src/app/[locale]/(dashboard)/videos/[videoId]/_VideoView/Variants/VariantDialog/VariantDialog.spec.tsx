import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { GetAdminVideoVariant } from '../../../../../../../../libs/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { UPDATE_VARIANT, VariantDialog } from './VariantDialog'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

const variant: GetAdminVideoVariant = {
  ...useAdminVideoMock?.['result']?.['data']['adminVideo']['variants'][0],
  published: true
}

const updateVariantMock = {
  request: {
    query: UPDATE_VARIANT,
    variables: {
      input: {
        id: variant.id,
        published: false
      }
    }
  },
  result: {
    data: {
      videoVariantUpdate: {
        ...variant,
        published: false
      }
    }
  }
}

describe('VariantDialog', () => {
  it('should show variant information', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <VariantDialog variant={variant} open />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(
      screen.getByRole('heading', { level: 4, name: 'Downloads' })
    ).toBeInTheDocument()
    expect(screen.getByText('https://arc.gt/4d9ez')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()

    const languageDisplay = screen.getByTestId('VariantLanguageDisplay')
    expect(languageDisplay).toHaveTextContent('Munukutuba')
    expect(screen.getByText('Published')).toBeInTheDocument()
  })

  it('should close variant dialog on click', () => {
    const handleClose = jest.fn()

    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <VariantDialog variant={variant} open handleClose={handleClose} />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    fireEvent.click(screen.getByTestId('dialog-close-button'))
    expect(handleClose).toHaveBeenCalled()
  })

  it('should toggle published state', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider mocks={[updateVariantMock]}>
          <VariantDialog variant={variant} open />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    const publishedChip = screen.getByText('Published')
    fireEvent.click(publishedChip)

    await waitFor(() => {
      expect(screen.getByText('Draft')).toBeInTheDocument()
    })
  })
})
