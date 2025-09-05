import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useLanguages } from '../../../libs/useLanguages'
import { WatchProvider } from '../../../libs/watchContext'

import { AudioTrackSelect } from './AudioTrackSelect'

// Mock useLanguageActions hook specifically for testing onChange behavior
const mockUpdateAudioLanguage = jest.fn()
jest.mock('../../../libs/watchContext', () => ({
  ...jest.requireActual('../../../libs/watchContext'),
  useLanguageActions: () => ({
    updateAudioLanguage: mockUpdateAudioLanguage
  })
}))

jest.mock('../../../libs/useLanguages', () => ({
  useLanguages: jest.fn()
}))

const useLanguagesMock = useLanguages as jest.MockedFunction<
  typeof useLanguages
>

// Mock useInstantSearch hook specifically for testing instant search behavior
const mockSetIndexUiState = jest.fn()
const mockInstantSearch = {
  setIndexUiState: mockSetIndexUiState
}

jest.mock('react-instantsearch', () => ({
  useInstantSearch: jest.fn()
}))

const useInstantSearchMock = require('react-instantsearch')
  .useInstantSearch as jest.Mock

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
    useInstantSearchMock.mockReturnValue(undefined) // Default to no instant search
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
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WatchProvider>
          <AudioTrackSelect audioLanguageId="496" />
        </WatchProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        screen.getByTestId('AudioTrackSelectNativeName')
      ).toHaveTextContent('Français')
      expect(screen.getByRole('combobox')).toHaveValue('French')
    })
  })

  describe('helper text', () => {
    it('should show helper text', async () => {
      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <WatchProvider>
            <AudioTrackSelect audioLanguageId="529" />
          </WatchProvider>
        </MockedProvider>
      )

      await waitFor(() => {
        expect(
          screen.getByText('Available in 3 languages.')
        ).toBeInTheDocument()
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
            <AudioTrackSelect audioLanguageId="529" />
          </WatchProvider>
        </MockedProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument()
      })
    })

    it('should show available languages text when videoAudioLanguageIds is not null', async () => {
      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <WatchProvider>
            <AudioTrackSelect
              audioLanguageId="529"
              videoAudioLanguageIds={['529', '496']}
            />
          </WatchProvider>
        </MockedProvider>
      )

      await waitFor(() => {
        expect(
          screen.getByText('Available in 2 languages.')
        ).toBeInTheDocument()
      })
    })

    it('should show not available languages text when videoAudioLanguageIds is not null and audioLanguageId does not match', async () => {
      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <WatchProvider>
            <AudioTrackSelect
              audioLanguageId="529"
              videoAudioLanguageIds={['496', '21028']}
            />
          </WatchProvider>
        </MockedProvider>
      )

      await waitFor(() => {
        expect(
          screen.getByText(
            'This content is not available in English. Available in 2 languages.'
          )
        ).toBeInTheDocument()
      })
    })
  })

  describe('native name', () => {
    it('should display native name when audioLanguageId matches a language', async () => {
      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <WatchProvider>
            <AudioTrackSelect audioLanguageId="496" />
          </WatchProvider>
        </MockedProvider>
      )

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toHaveValue('French')
      })

      expect(
        screen.getByTestId('AudioTrackSelectNativeName')
      ).toHaveTextContent('Français')
    })

    it('should not display native name when it matches the display name', async () => {
      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <WatchProvider>
            <AudioTrackSelect audioLanguageId="529" />
          </WatchProvider>
        </MockedProvider>
      )

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toHaveValue('English')
      })

      expect(
        screen.queryByTestId('AudioTrackSelectNativeName')
      ).not.toBeInTheDocument()
    })
  })

  describe('autocomplete', () => {
    it('should show available languages text when videoAudioLanguageIds is not null', async () => {
      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <WatchProvider>
            <AudioTrackSelect
              audioLanguageId="529"
              videoAudioLanguageIds={['529', '496']}
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

    it('should call updateAudioLanguage when a language is selected', async () => {
      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <WatchProvider>
            <AudioTrackSelect audioLanguageId="529" />
          </WatchProvider>
        </MockedProvider>
      )

      await userEvent.click(screen.getByRole('combobox'))
      await userEvent.click(
        screen.getByRole('option', { name: 'French Français' })
      )

      await waitFor(() => {
        expect(mockUpdateAudioLanguage).toHaveBeenCalledWith(french, false)
      })
    })

    it('should call updateAudioLanguage with reload true when selected language is in videoAudioLanguageIds', async () => {
      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <WatchProvider>
            <AudioTrackSelect
              audioLanguageId="529"
              videoAudioLanguageIds={['529', '496']}
            />
          </WatchProvider>
        </MockedProvider>
      )

      await userEvent.click(screen.getByRole('combobox'))
      await userEvent.click(
        screen.getByRole('option', { name: 'French Français' })
      )

      await waitFor(() => {
        expect(mockUpdateAudioLanguage).toHaveBeenCalledWith(french, true)
      })
    })

    it('should call setIndexUiState when instantSearch is not null', async () => {
      useInstantSearchMock.mockReturnValue(mockInstantSearch)

      render(
        <MockedProvider mocks={[]} addTypename={false}>
          <WatchProvider>
            <AudioTrackSelect audioLanguageId="529" />
          </WatchProvider>
        </MockedProvider>
      )
      await userEvent.click(screen.getByRole('combobox'))
      await userEvent.click(
        screen.getByRole('option', { name: 'French Français' })
      )

      await waitFor(() => {
        expect(mockSetIndexUiState).toHaveBeenCalledWith(expect.any(Function))
      })
      expect(
        mockSetIndexUiState.mock.calls[0][0]({
          test: 'test',
          refinementList: {
            test: 'test',
            languageEnglishName: ['English']
          }
        })
      ).toEqual({
        test: 'test',
        refinementList: {
          test: 'test',
          languageEnglishName: ['French']
        }
      })
    })
  })
})
