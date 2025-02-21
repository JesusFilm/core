import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { SnackbarProvider } from 'notistack'

import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'

import {
  AddAudioLanguageDialog,
  CREATE_VIDEO_VARIANT
} from './AddAudioLanguageDialog'

jest.mock('next/navigation', () => ({
  useParams: () => ({ videoId: 'video123' })
}))

const mocks = [
  {
    request: {
      query: GET_LANGUAGES,
      variables: { languageId: '529' }
    },
    result: {
      data: {
        languages: [
          {
            id: '529',
            name: [
              { value: 'English', primary: true },
              { value: 'English', primary: false }
            ],
            slug: 'en'
          }
        ]
      }
    }
  }
]

const createVideoVariantMock = {
  request: {
    query: CREATE_VIDEO_VARIANT,
    variables: {
      input: {
        id: '529_video123',
        videoId: 'video123',
        edition: 'base',
        languageId: '529',
        slug: 'video123/en',
        downloadable: true,
        published: true
      }
    }
  },
  result: {
    data: {
      videoVariantCreate: {
        id: 'variant1',
        videoId: 'video123',
        slug: 'video123/en',
        language: {
          id: 'lang1',
          name: [
            { value: 'English', primary: true },
            { value: 'English', primary: false }
          ]
        }
      }
    }
  }
}

describe('AddAudioLanguageDialog', () => {
  it('should render dialog with edition and language inputs', async () => {
    render(
      <MockedProvider mocks={mocks}>
        <SnackbarProvider>
          <NextIntlClientProvider locale="en">
            <AddAudioLanguageDialog
              open
              handleClose={jest.fn()}
              variantLanguagesMap={new Map()}
              editions={[{ id: 'edition1', name: 'base' }]}
            />
          </NextIntlClientProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(screen.getByText('Add Audio Language')).toBeInTheDocument()
    expect(screen.getByTestId('EditionSelect')).toBeInTheDocument()
    expect(screen.getByLabelText('Language')).toBeInTheDocument()
  })

  it('should disable add button when no language selected', () => {
    render(
      <MockedProvider mocks={mocks}>
        <SnackbarProvider>
          <NextIntlClientProvider locale="en">
            <AddAudioLanguageDialog
              open
              handleClose={jest.fn()}
              variantLanguagesMap={new Map()}
              editions={[{ id: 'edition1', name: 'base' }]}
            />
          </NextIntlClientProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(screen.getByText('Add')).toBeDisabled()
  })

  it('should create variant when submitting form', async () => {
    const result = jest.fn().mockReturnValue(createVideoVariantMock.result)
    const handleClose = jest.fn()
    render(
      <MockedProvider mocks={[...mocks, { ...createVideoVariantMock, result }]}>
        <SnackbarProvider>
          <NextIntlClientProvider locale="en">
            <AddAudioLanguageDialog
              open
              handleClose={handleClose}
              variantLanguagesMap={new Map()}
              editions={[{ id: 'edition1', name: 'base' }]}
            />
          </NextIntlClientProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    // Select edition

    fireEvent.mouseDown(screen.getByText('Add Audio Language'))
    fireEvent.keyDown(screen.getByRole('combobox', { name: '' }), {
      key: 'ArrowDown'
    })
    await waitFor(() =>
      fireEvent.click(screen.getByRole('option', { name: 'base' }))
    )

    fireEvent.mouseDown(screen.getByLabelText('Language'))
    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Language' }), {
      key: 'ArrowDown'
    })
    await waitFor(() =>
      fireEvent.click(screen.getByRole('option', { name: 'English English' }))
    )

    fireEvent.click(screen.getByText('Add'))
    await waitFor(() => {
      expect(handleClose).toHaveBeenCalled()
    })
  })
})
