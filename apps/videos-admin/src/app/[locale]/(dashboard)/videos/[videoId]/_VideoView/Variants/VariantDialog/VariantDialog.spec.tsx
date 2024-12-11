import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { getLanguagesMock } from '@core/journeys/ui/useLanguagesQuery/useLanguagesQuery.mock'

import { GetAdminVideoVariant } from '../../../../../../../../libs/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import {
  UPDATE_VARIANT_LANGUAGE,
  VariantDialog,
  VideoVariantUpdate,
  VideoVariantUpdateVariables
} from './VariantDialog'

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

const mockVideoVariantUpdate: MockedResponse<
  VideoVariantUpdate,
  VideoVariantUpdateVariables
> = {
  request: {
    query: UPDATE_VARIANT_LANGUAGE,
    variables: {
      input: { id: '1_4334-jf-0-0', languageId: '496', slug: 'jesus/french' }
    }
  },
  result: {
    data: {
      videoVariantUpdate: {
        id: variant.id,
        videoId: variant.videoId,
        slug: 'jesus/french',
        language: {
          id: '496',
          name: [
            {
              value: 'Français',
              primary: true
            },
            {
              value: 'French',
              primary: false
            }
          ]
        }
      }
    }
  }
}

describe('VariantDialog', () => {
  it('should show variant information', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider mocks={[getLanguagesMock]}>
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
    expect(screen.getByRole('combobox')).toHaveValue('Munukutuba')
  })

  it('should close variant dialog on click', () => {
    const handleClose = jest.fn()

    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider mocks={[getLanguagesMock]}>
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

  it('should not allow the submission of an existing variant in languages select', async () => {
    const handleClose = jest.fn()

    const getLanguagesMockResult = jest
      .fn()
      .mockReturnValue(getLanguagesMock.result)

    render(
      // <SnackbarProvider>
      <NextIntlClientProvider locale="en">
        <MockedProvider
          mocks={[{ ...getLanguagesMock, result: getLanguagesMockResult }]}
        >
          <VariantDialog
            variant={variant}
            open
            handleClose={handleClose}
            variantLanguagesMap={mockVariantLanguages}
          />
        </MockedProvider>
      </NextIntlClientProvider>
      // </SnackbarProvider>
    )

    await waitFor(() => expect(getLanguagesMockResult).toHaveBeenCalled())
    fireEvent.focus(screen.getByRole('combobox'))
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' })

    await waitFor(() =>
      fireEvent.click(screen.getByRole('option', { name: 'English' }))
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    await waitFor(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    )
  })

  it('should handle variant language update', async () => {
    const handleClose = jest.fn()

    const getLanguagesMockResult = jest
      .fn()
      .mockReturnValue(getLanguagesMock.result)

    const updateVariantLanguageResult = jest
      .fn()
      .mockReturnValue(mockVideoVariantUpdate.result)

    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider
          mocks={[
            { ...getLanguagesMock, result: getLanguagesMockResult },
            { ...mockVideoVariantUpdate, result: updateVariantLanguageResult }
          ]}
        >
          <VariantDialog
            variant={variant}
            open
            handleClose={handleClose}
            variantLanguagesMap={mockVariantLanguages}
          />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    await waitFor(() => expect(getLanguagesMockResult).toHaveBeenCalled())
    fireEvent.focus(screen.getByRole('combobox'))
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' })

    await waitFor(() =>
      fireEvent.click(screen.getByRole('option', { name: 'French Français' }))
    )
    await waitFor(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    )
    await waitFor(() => expect(updateVariantLanguageResult).toHaveBeenCalled())
  })
})
