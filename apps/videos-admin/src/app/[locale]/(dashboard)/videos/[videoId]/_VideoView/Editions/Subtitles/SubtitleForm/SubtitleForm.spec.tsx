import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'

import { getLanguagesMock } from '@core/journeys/ui/useLanguagesQuery/useLanguagesQuery.mock'

import { useAdminVideoMock } from '../../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { SubtitleForm } from './SubtitleForm'

const mockSubtitle =
  useAdminVideoMock['result']?.['data']?.adminVideo.videoEditions[0]
    .videoSubtitles[0]

describe('SubtitleForm', () => {
  it('should render as create form', async () => {
    const onSubmit = jest.fn()

    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider mocks={[getLanguagesMock]}>
          <SubtitleForm
            variant="create"
            initialValues={{ language: '', primary: false, file: null }}
            onSubmit={onSubmit}
          />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    const user = userEvent.setup()

    const languageSelect = screen.getByRole('combobox', { name: 'Language' })
    await user.click(languageSelect)
    await waitFor(async () => {
      await user.click(screen.getByRole('option', { name: 'English' }))
    })

    await user.click(screen.getByRole('checkbox', { name: 'Primary' }))

    const file = new File(['test'], 'test.vtt', { type: 'text/vtt' })

    const dropzone = screen.getByTestId('DropZone')
    await user.upload(dropzone, file)

    const button = screen.getByRole('button', { name: 'Create' })
    await user.click(button)

    expect(onSubmit).toHaveBeenCalledWith(
      {
        language: '529',
        primary: true,
        file
      },
      expect.any(Object)
    )
  })

  it('should render as edit form', async () => {
    const onSubmit = jest.fn()
    const existingFile = new File(['existing file'], 'existing.vtt', {
      type: 'text/vtt'
    })

    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider mocks={[getLanguagesMock]}>
          <SubtitleForm
            variant="edit"
            initialValues={{
              language: mockSubtitle.language.id,
              primary: true,
              file: existingFile
            }}
            onSubmit={onSubmit}
          />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    const user = userEvent.setup()

    const languageSelect = screen.getByRole('combobox', { name: 'Language' })

    await user.click(languageSelect)
    await waitFor(async () => {
      await user.click(screen.getByRole('option', { name: 'Spanish' }))
    })

    await user.click(screen.getByRole('checkbox', { name: 'Primary' }))

    const newFile = new File(['new file'], 'new.vtt', { type: 'text/vtt' })

    const dropzone = screen.getByTestId('DropZone')
    await user.upload(dropzone, newFile)

    const button = screen.getByRole('button', { name: 'Update' })
    await user.click(button)

    expect(onSubmit).toHaveBeenCalledWith(
      {
        language: '528',
        primary: false,
        file: newFile
      },
      expect.any(Object)
    )
  })
})
