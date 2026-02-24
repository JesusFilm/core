import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useLanguages } from '../../../libs/useLanguages'

import { SubtitlesSelect } from './SubtitlesSelect'

jest.mock('../../../libs/useLanguages', () => ({
  useLanguages: jest.fn()
}))

const useLanguagesMock = useLanguages as jest.MockedFunction<
  typeof useLanguages
>

describe('SubtitlesSelect', () => {
  const french = {
    id: '496',
    slug: 'french',
    displayName: 'French',
    name: { id: '529', value: 'French', primary: false },
    englishName: { id: '496', value: 'French', primary: false },
    nativeName: { id: '496', value: 'Français', primary: true }
  }

  const spanish = {
    id: '21028',
    slug: 'spanish',
    displayName: 'Spanish',
    name: { id: '21028', value: 'Spanish', primary: false },
    englishName: { id: '21028', value: 'Spanish', primary: false },
    nativeName: { id: '21028', value: 'Español', primary: true }
  }

  const english = {
    id: '529',
    slug: 'english',
    displayName: 'English',
    name: { id: '529', value: 'English', primary: true },
    englishName: { id: '529', value: 'English', primary: true },
    nativeName: { id: '529', value: 'English', primary: true }
  }

  const nonSubtitleLanguage = {
    id: '987654',
    slug: 'non-subtitle-language',
    displayName: 'Non Subtitle Language',
    name: { id: '987654', value: 'Non Subtitle Language', primary: false },
    englishName: {
      id: '987654',
      value: 'Non Subtitle Language',
      primary: false
    },
    nativeName: { id: '987654', value: 'Non Subtitle Language', primary: true }
  }

  const languages = [english, french, spanish, nonSubtitleLanguage]

  beforeEach(() => {
    jest.clearAllMocks()
    useLanguagesMock.mockReturnValue({
      languages,
      isLoading: false
    })
  })

  describe('helper text', () => {
    it('should show helper text', async () => {
      render(<SubtitlesSelect subtitleLanguageId="529" />)

      await waitFor(() => {
        expect(
          screen.getByTestId('SubtitlesSelectLanguageCount')
        ).toHaveTextContent('3 languages')
      })
    })

    it('should show loading text when isLoading is true', async () => {
      useLanguagesMock.mockReturnValue({
        languages: [],
        isLoading: true
      })

      render(<SubtitlesSelect subtitleOn subtitleLanguageId="529" />)

      await waitFor(() => {
        expect(screen.getByText('Loading languages...')).toBeInTheDocument()
      })
    })

    it('should show available languages text when videoSubtitleLanguageIds is not null', async () => {
      render(
        <SubtitlesSelect
          subtitleOn
          subtitleLanguageId="529"
          videoSubtitleLanguageIds={['529', '496']}
        />
      )

      await waitFor(() => {
        expect(
          screen.getByTestId('SubtitlesSelectLanguageCount')
        ).toHaveTextContent('2 languages')
      })
    })
  })

  describe('autocomplete', () => {
    it('should show available languages text when videoSubtitleLanguageIds is not null', async () => {
      render(
        <SubtitlesSelect
          subtitleOn
          subtitleLanguageId="529"
          videoSubtitleLanguageIds={['529', '496']}
        />
      )

      await userEvent.click(screen.getByRole('combobox'))

      // available languages
      expect(
        screen.getByRole('option', { name: 'English' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('option', { name: 'French Français' })
      ).toBeInTheDocument()
      // other languages
      expect(
        screen.queryByRole('option', { name: 'Spanish Español' })
      ).not.toBeInTheDocument()
    })

    it('should call onLanguageChange when a language is selected', async () => {
      const onLanguageChange = jest.fn()
      render(
        <SubtitlesSelect
          subtitleOn
          subtitleLanguageId="529"
          onLanguageChange={onLanguageChange}
        />
      )

      await userEvent.click(screen.getByRole('combobox'))
      await userEvent.click(
        screen.getByRole('option', { name: 'French Français' })
      )

      await waitFor(() => {
        expect(onLanguageChange).toHaveBeenCalledWith(french.id)
      })
    })
  })

  describe('switch', () => {
    it('should call updateSubtitleOn when checkbox is changed', async () => {
      const onSubtitleToggleChange = jest.fn()
      render(
        <SubtitlesSelect
          subtitleOn
          onSubtitleToggleChange={onSubtitleToggleChange}
        />
      )

      await userEvent.click(
        screen.getByRole('switch', { name: 'Show subtitles' })
      )

      await waitFor(() => {
        expect(onSubtitleToggleChange).toHaveBeenCalledWith(false)
      })
    })
  })
})
