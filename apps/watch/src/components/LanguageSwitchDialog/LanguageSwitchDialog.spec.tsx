import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useLanguages } from '../../libs/useLanguages'
import { WatchProvider } from '../../libs/watchContext'

import { LanguageSwitchDialog } from './LanguageSwitchDialog'

jest.mock('../../libs/useLanguages', () => ({
  useLanguages: jest.fn()
}))
const useLanguagesMock = useLanguages as jest.MockedFunction<
  typeof useLanguages
>

describe('LanguageSwitchDialog', () => {
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

  it('should render dialog with all components', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WatchProvider>
          <LanguageSwitchDialog open />
        </WatchProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText('Language Settings')).toBeInTheDocument()
  })

  it('should hide dialog if open is false', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WatchProvider>
          <LanguageSwitchDialog open={false} />
        </WatchProvider>
      </MockedProvider>
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should hide the dialog if open is not provided', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WatchProvider>
          <LanguageSwitchDialog />
        </WatchProvider>
      </MockedProvider>
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should call handleClose when close button is clicked', async () => {
    const mockHandleClose = jest.fn()
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WatchProvider>
          <LanguageSwitchDialog open handleClose={mockHandleClose} />
        </WatchProvider>
      </MockedProvider>
    )

    const closeButton = screen.getByRole('button', { name: /close/i })
    await userEvent.click(closeButton)

    expect(mockHandleClose).toHaveBeenCalled()
  })

  it('should render audio track select', async () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WatchProvider
          initialState={{
            audioLanguageId: '529',
            videoAudioLanguageIds: ['529', '496']
          }}
        >
          <LanguageSwitchDialog open />
        </WatchProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getAllByRole('combobox')[0]).toBeInTheDocument()
    })
    expect(screen.getAllByRole('combobox')[0]).toHaveValue('English')

    const audioTrackSelect = screen.getAllByRole('combobox')[0]
    await userEvent.click(audioTrackSelect)
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

  it('should render subtitles select', async () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WatchProvider
          initialState={{
            subtitleLanguageId: '529',
            videoSubtitleLanguageIds: ['529', '496']
          }}
        >
          <LanguageSwitchDialog open />
        </WatchProvider>
      </MockedProvider>
    )
    await waitFor(() => {
      expect(screen.getAllByRole('combobox')[1]).toBeInTheDocument()
    })
    expect(screen.getAllByRole('combobox')[1]).toHaveValue('English')

    const subtitlesSelect = screen.getAllByRole('combobox')[1]
    await userEvent.click(subtitlesSelect)
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

  it('should render subtitle checkbox checked if subtitleOn is true', async () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WatchProvider initialState={{ subtitleOn: true }}>
          <LanguageSwitchDialog open />
        </WatchProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('should render subtitle checkbox unchecked if subtitleOn is false', async () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WatchProvider initialState={{ subtitleOn: false }}>
          <LanguageSwitchDialog open />
        </WatchProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })
})
