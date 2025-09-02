import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useLanguages } from '../../../libs/useLanguages'
import { WatchProvider } from '../../../libs/watchContext'

import { SubtitlesSelect } from './SubtitlesSelect'

// Mock useLanguageActions hook specifically for testing onChange behavior
const mockUpdateSubtitleLanguage = jest.fn()
const mockUpdateSubtitlesOn = jest.fn()
jest.mock('../../../libs/watchContext', () => ({
  ...jest.requireActual('../../../libs/watchContext'),
  useLanguageActions: () => ({
    updateSubtitleLanguage: mockUpdateSubtitleLanguage,
    updateSubtitlesOn: mockUpdateSubtitlesOn
  })
}))

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

  beforeEach(() => {
    jest.clearAllMocks()
    useLanguagesMock.mockReturnValue({
      languages: [
        {
          id: '529',
          slug: 'english',
          displayName: 'English',
          name: { id: '529', value: 'English', primary: true },
          englishName: { id: '529', value: 'English', primary: true }
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

  it('should display native name and display name when subtitleLanguageId matches a language', async () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WatchProvider>
          <SubtitlesSelect subtitleLanguageId="496" />
        </WatchProvider>
      </MockedProvider>
    )
    await waitFor(() => {
      expect(screen.getByTestId('SubtitlesSelectNativeName')).toHaveTextContent(
        'Français'
      )
    })
    expect(screen.getByRole('combobox')).toHaveValue('French')
  })

  describe('helper text', () => {
    it('should show helper text', async () => {
      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <WatchProvider>
            <SubtitlesSelect subtitleLanguageId="529" />
          </WatchProvider>
        </MockedProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('3 languages')).toBeInTheDocument()
      })
    })

    it('should show loading text when isLoading is true', async () => {
      useLanguagesMock.mockReturnValue({
        languages: [],
        isLoading: true
      })

      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <WatchProvider>
            <SubtitlesSelect subtitleLanguageId="529" />
          </WatchProvider>
        </MockedProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument()
      })
    })

    it('should show available languages text when videoSubtitleLanguageIds is not null', async () => {
      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <WatchProvider>
            <SubtitlesSelect
              subtitleLanguageId="529"
              videoSubtitleLanguageIds={['529', '496']}
            />
          </WatchProvider>
        </MockedProvider>
      )

      await waitFor(() => {
        expect(
          screen.getByText('Subtitles are available in 2 languages.')
        ).toBeInTheDocument()
      })
    })

    it('should show not available languages text when videoSubtitleLanguageIds is not null and subtitleLanguageId does not match', async () => {
      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <WatchProvider>
            <SubtitlesSelect
              subtitleLanguageId="529"
              videoSubtitleLanguageIds={['496', '21028']}
            />
          </WatchProvider>
        </MockedProvider>
      )

      await waitFor(() => {
        expect(
          screen.getByText(
            'Subtitles are not available in English. Available in 2 languages.'
          )
        ).toBeInTheDocument()
      })
    })
  })

  describe('autocomplete', () => {
    it('should show available languages text when videoSubtitleLanguageIds is not null', async () => {
      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <WatchProvider>
            <SubtitlesSelect
              subtitleLanguageId="529"
              videoSubtitleLanguageIds={['529', '496']}
            />
          </WatchProvider>
        </MockedProvider>
      )

      await userEvent.click(screen.getByRole('combobox'))

      await waitFor(() => {
        expect(screen.getByText('Available Languages')).toBeInTheDocument()
        expect(screen.getByText('Other Languages')).toBeInTheDocument()
      })
      // available languages
      expect(screen.getAllByRole('list')[0].children[0]).toHaveTextContent(
        'English'
      )
      expect(screen.getAllByRole('list')[0].children[1]).toHaveTextContent(
        'FrenchFrançais'
      )
      // other languages
      expect(screen.getAllByRole('list')[1].children[0]).toHaveTextContent(
        'SpanishEspañol'
      )
    })

    it('should call updateSubtitleLanguage when a language is selected', async () => {
      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <WatchProvider>
            <SubtitlesSelect subtitleLanguageId="529" />
          </WatchProvider>
        </MockedProvider>
      )

      await userEvent.click(screen.getByRole('combobox'))
      await userEvent.click(
        screen.getByRole('option', { name: 'French Français' })
      )

      await waitFor(() => {
        expect(mockUpdateSubtitleLanguage).toHaveBeenCalledWith(french)
      })
    })
  })

  describe('checkbox', () => {
    it('should call updateSubtitleOn when checkbox is changed', async () => {
      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <WatchProvider>
            <SubtitlesSelect subtitleOn />
          </WatchProvider>
        </MockedProvider>
      )

      await userEvent.click(screen.getByRole('checkbox'))

      await waitFor(() => {
        expect(mockUpdateSubtitlesOn).toHaveBeenCalledWith(false)
      })
    })
  })
})
