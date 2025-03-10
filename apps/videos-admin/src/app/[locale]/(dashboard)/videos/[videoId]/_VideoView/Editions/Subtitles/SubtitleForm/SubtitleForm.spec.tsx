import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'

import { getLanguagesMock } from '@core/journeys/ui/useLanguagesQuery/useLanguagesQuery.mock'

import { useAdminVideoMock } from '../../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { SubtitleForm } from './SubtitleForm'

const originalCreateObjectURL = global.URL.createObjectURL

global.URL.createObjectURL = jest.fn(() => 'mock-url')

const mockVideo = useAdminVideoMock['result']?.['data']?.adminVideo
const mockEdition = mockVideo.videoEditions[0]
const mockSubtitle = mockEdition.videoSubtitles[0]
const mockSubtitle2 = mockEdition.videoSubtitles[1]

// Create a mock subtitleLanguagesMap
const mockSubtitleLanguagesMap = new Map([
  [mockSubtitle.language.id, mockSubtitle],
  [mockSubtitle2.language.id, mockSubtitle2]
])

describe('SubtitleForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    global.URL.createObjectURL = originalCreateObjectURL
  })

  it('should render as create form', async () => {
    const onSubmit = jest.fn()

    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider mocks={[getLanguagesMock]}>
          <SubtitleForm
            variant="create"
            initialValues={{ language: '', vttFile: null, srtFile: null }}
            onSubmit={onSubmit}
            subtitleLanguagesMap={mockSubtitleLanguagesMap}
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

    const vttFile = new File(['test vtt content'], 'test.vtt', {
      type: 'text/vtt'
    })

    const dropzone = screen.getByTestId('DropZone')
    await user.upload(dropzone, vttFile)

    const button = screen.getByRole('button', { name: 'Create' })
    await user.click(button)

    expect(onSubmit).toHaveBeenCalledWith(
      {
        language: '528',
        vttFile,
        srtFile: null
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
            subtitle={mockSubtitle}
            initialValues={{
              language: mockSubtitle.language.id,
              vttFile: existingFile,
              srtFile: null
            }}
            onSubmit={onSubmit}
            subtitleLanguagesMap={mockSubtitleLanguagesMap}
          />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByText('existing.vtt')).toBeInTheDocument()
  })

  it('should handle simultaneous uploads of VTT and SRT files', async () => {
    const onSubmit = jest.fn()
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider mocks={[getLanguagesMock]}>
          <SubtitleForm
            variant="create"
            initialValues={{
              language: '',
              vttFile: null,
              srtFile: null
            }}
            onSubmit={onSubmit}
            subtitleLanguagesMap={mockSubtitleLanguagesMap}
          />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    const user = userEvent.setup()

    // Select language
    const languageSelect = screen.getByRole('combobox', { name: 'Language' })
    await user.click(languageSelect)
    await waitFor(async () => {
      await user.click(screen.getByRole('option', { name: 'Spanish' }))
    })

    // Create test files
    const vttFile = new File(['vtt content'], 'subtitle.vtt', {
      type: 'text/vtt'
    })
    const srtFile = new File(['srt content'], 'subtitle.srt', {
      type: 'text/plain'
    })

    // Upload both files
    const dropzone = screen.getByTestId('DropZone')
    await user.upload(dropzone, [vttFile, srtFile])

    // Verify both files are displayed
    expect(screen.getByText('subtitle.vtt')).toBeInTheDocument()
    expect(screen.getByText('subtitle.srt')).toBeInTheDocument()

    // Submit the form
    const button = screen.getByRole('button', { name: 'Create' })
    await user.click(button)

    // Check that onSubmit was called with both files
    expect(onSubmit).toHaveBeenCalledWith(
      {
        language: '528',
        vttFile,
        srtFile
      },
      expect.any(Object)
    )
  })

  it('should filter out languages that already have subtitles', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider mocks={[getLanguagesMock]}>
          <SubtitleForm
            variant="create"
            initialValues={{ language: '', vttFile: null, srtFile: null }}
            onSubmit={jest.fn()}
            subtitleLanguagesMap={mockSubtitleLanguagesMap}
          />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    const user = userEvent.setup()

    const languageSelect = screen.getByRole('combobox', { name: 'Language' })
    await user.click(languageSelect)

    await waitFor(() => {
      expect(
        screen.queryByRole('option', {
          name: mockSubtitle.language.name[0].value
        })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('option', {
          name: mockSubtitle2.language.name[0].value
        })
      ).not.toBeInTheDocument()
    })
  })

  it('should include current subtitle language when editing', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider mocks={[getLanguagesMock]}>
          <SubtitleForm
            variant="edit"
            subtitle={mockSubtitle}
            initialValues={{
              language: mockSubtitle.language.id,
              vttFile: null,
              srtFile: null
            }}
            onSubmit={jest.fn()}
            subtitleLanguagesMap={mockSubtitleLanguagesMap}
          />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    const user = userEvent.setup()

    const languageSelect = screen.getByRole('combobox', { name: 'Language' })
    await user.click(languageSelect)

    // Current subtitle's language should be in the dropdown
    await waitFor(() => {
      expect(
        screen.getByRole('option', {
          name: mockSubtitle.language.name[0].value
        })
      ).toBeInTheDocument()
    })

    // Other subtitle's language should not be in the dropdown
    expect(
      screen.queryByRole('option', {
        name: mockSubtitle2.language.name[0].value
      })
    ).not.toBeInTheDocument()
  })
})
