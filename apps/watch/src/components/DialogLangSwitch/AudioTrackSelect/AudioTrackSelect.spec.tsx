import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useLanguages } from '../../../libs/useLanguages'

import { AudioTrackSelect } from './AudioTrackSelect'

jest.mock('../../../libs/useLanguages', () => ({
  useLanguages: jest.fn()
}))

const useLanguagesMock = useLanguages as jest.MockedFunction<
  typeof useLanguages
>

describe('AudioTrackSelect', () => {
  const french = {
    id: '496',
    slug: 'french',
    displayName: 'French',
    name: { id: '529', value: 'French', primary: false },
    englishName: { id: '496', value: 'French', primary: false },
    nativeName: { id: '496', value: 'Français', primary: true }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    useLanguagesMock.mockReturnValue({
      languages: [
        {
          id: '529',
          slug: 'english',
          displayName: 'English',
          name: { id: '529', value: 'English', primary: true },
          englishName: { id: '529', value: 'English', primary: true },
          nativeName: { id: '529', value: 'English', primary: true }
        },
        french,
        {
          id: '21028',
          slug: 'spanish',
          displayName: 'Spanish',
          name: { id: '21028', value: 'Spanish', primary: false },
          englishName: { id: '21028', value: 'Spanish', primary: false },
          nativeName: { id: '21028', value: 'Español', primary: true }
        }
      ],
      isLoading: false
    })
  })

  it('should display native name and display name when audioLanguageId matches a language', async () => {
    render(<AudioTrackSelect audioLanguageId="496" />)

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveTextContent('French')
    })
  })

  describe('helper text', () => {
    it('should show helper text', async () => {
      render(<AudioTrackSelect audioLanguageId="529" />)

      await waitFor(() => {
        expect(
          screen.getByTestId('AudioTrackSelectLanguageCount')
        ).toHaveTextContent('3 languages')
      })
    })

    it('should show available languages text when videoAudioLanguageIds is not null', async () => {
      render(
        <AudioTrackSelect
          audioLanguageId="529"
          videoAudioLanguageIds={['529', '496']}
        />
      )

      await waitFor(() => {
        expect(
          screen.getByTestId('AudioTrackSelectLanguageCount')
        ).toHaveTextContent('2 languages')
      })
    })
  })

  describe('autocomplete', () => {
    it('should show available languages text when videoAudioLanguageIds is not null', async () => {
      render(
        <AudioTrackSelect
          audioLanguageId="529"
          videoAudioLanguageIds={['529', '496']}
        />
      )

      await userEvent.click(screen.getByRole('combobox'))

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
        <AudioTrackSelect
          audioLanguageId="529"
          onLanguageChange={onLanguageChange}
        />
      )

      await userEvent.click(screen.getByRole('combobox'))
      await userEvent.click(
        screen.getByRole('option', { name: 'French Français' })
      )

      await waitFor(() => {
        expect(onLanguageChange).toHaveBeenCalledWith(french)
      })
    })

    it('should call updateAudioLanguage with reload true when selected language is in videoAudioLanguageIds', async () => {
      const onLanguageChange = jest.fn()
      render(
        <AudioTrackSelect
          audioLanguageId="529"
          videoAudioLanguageIds={['529', '496']}
          onLanguageChange={onLanguageChange}
        />
      )

      await userEvent.click(screen.getByRole('combobox'))
      await userEvent.click(
        screen.getByRole('option', { name: 'French Français' })
      )

      await waitFor(() => {
        expect(onLanguageChange).toHaveBeenCalledWith(french)
      })
    })
  })
})
