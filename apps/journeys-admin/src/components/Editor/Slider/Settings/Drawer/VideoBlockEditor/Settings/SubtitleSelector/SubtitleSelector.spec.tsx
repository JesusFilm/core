import { fireEvent, render, screen, within } from '@testing-library/react'

import { SubtitleSelector } from './SubtitleSelector'

const mockYouTubeLanguages = [
  {
    id: 'lang-en',
    bcp47: 'en',
    name: [
      {
        value: 'English',
        primary: true,
        __typename: 'YouTubeLanguageName' as const
      },
      {
        value: 'Inglés',
        primary: false,
        __typename: 'YouTubeLanguageName' as const
      }
    ],
    __typename: 'YouTubeLanguage' as const
  },
  {
    id: 'lang-es',
    bcp47: 'es',
    name: [
      {
        value: 'Spanish',
        primary: true,
        __typename: 'YouTubeLanguageName' as const
      }
    ],
    __typename: 'YouTubeLanguage' as const
  },
  {
    id: 'lang-fr',
    bcp47: 'fr',
    name: [
      {
        value: 'French',
        primary: true,
        __typename: 'YouTubeLanguageName' as const
      },
      {
        value: 'Français',
        primary: false,
        __typename: 'YouTubeLanguageName' as const
      }
    ],
    __typename: 'YouTubeLanguage' as const
  }
]

describe('SubtitleSelector', () => {
  it('renders with "Off" selected when selectedSubtitleId is null', () => {
    render(
      <SubtitleSelector
        selectedSubtitleId={null}
        availableLanguages={mockYouTubeLanguages}
        onChange={jest.fn()}
      />
    )

    expect(screen.getByRole('combobox')).toHaveTextContent('Off')
  })

  it('displays available subtitle languages in dropdown', () => {
    render(
      <SubtitleSelector
        selectedSubtitleId={null}
        availableLanguages={mockYouTubeLanguages}
        onChange={jest.fn()}
      />
    )

    fireEvent.mouseDown(screen.getByRole('combobox'))

    const listbox = screen.getByRole('listbox')
    expect(within(listbox).getByText('Off')).toBeInTheDocument()
    expect(within(listbox).getByText('English (Inglés)')).toBeInTheDocument()
    expect(within(listbox).getByText('Spanish')).toBeInTheDocument()
    expect(within(listbox).getByText('French (Français)')).toBeInTheDocument()
  })

  it('handles language selection and calls onChange with correct ID', () => {
    const onChange = jest.fn()
    render(
      <SubtitleSelector
        selectedSubtitleId={null}
        availableLanguages={mockYouTubeLanguages}
        onChange={onChange}
      />
    )

    fireEvent.mouseDown(screen.getByRole('combobox'))
    fireEvent.click(screen.getByText('English (Inglés)'))

    expect(onChange).toHaveBeenCalledWith('lang-en')
  })

  it('handles selecting "Off" and calls onChange with null', () => {
    const onChange = jest.fn()
    render(
      <SubtitleSelector
        selectedSubtitleId="lang-en"
        availableLanguages={mockYouTubeLanguages}
        onChange={onChange}
      />
    )

    fireEvent.mouseDown(screen.getByRole('combobox'))
    const listbox = screen.getByRole('listbox')
    fireEvent.click(within(listbox).getByText('Off'))

    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('shows "No subtitles available" message when availableLanguages is empty', () => {
    render(
      <SubtitleSelector
        selectedSubtitleId={null}
        availableLanguages={[]}
        onChange={jest.fn()}
      />
    )

    expect(
      screen.getByText('This video does not have any subtitles')
    ).toBeInTheDocument()
  })

  it('disables select when disabled prop is true', () => {
    render(
      <SubtitleSelector
        selectedSubtitleId={null}
        availableLanguages={mockYouTubeLanguages}
        onChange={jest.fn()}
        disabled={true}
      />
    )

    const combobox = screen.getByRole('combobox')
    expect(combobox).toHaveClass('Mui-disabled')
  })

  it('language search filters languages by name', () => {
    render(
      <SubtitleSelector
        selectedSubtitleId={null}
        availableLanguages={mockYouTubeLanguages}
        onChange={jest.fn()}
      />
    )

    fireEvent.mouseDown(screen.getByRole('combobox'))

    const searchInput = screen.getByPlaceholderText('Search by language')
    fireEvent.change(searchInput, { target: { value: 'span' } })

    const listbox = screen.getByRole('listbox')
    expect(within(listbox).getByText('Spanish')).toBeInTheDocument()
    expect(
      within(listbox).queryByText('English (Inglés)')
    ).not.toBeInTheDocument()
    expect(
      within(listbox).queryByText('French (Français)')
    ).not.toBeInTheDocument()
  })

  it('language search filters languages by BCP47 code', () => {
    render(
      <SubtitleSelector
        selectedSubtitleId={null}
        availableLanguages={mockYouTubeLanguages}
        onChange={jest.fn()}
      />
    )

    fireEvent.mouseDown(screen.getByRole('combobox'))

    const searchInput = screen.getByPlaceholderText('Search by language')
    fireEvent.change(searchInput, { target: { value: 'fr' } })

    const listbox = screen.getByRole('listbox')
    expect(within(listbox).getByText('French (Français)')).toBeInTheDocument()
    expect(
      within(listbox).queryByText('English (Inglés)')
    ).not.toBeInTheDocument()
    expect(within(listbox).queryByText('Spanish')).not.toBeInTheDocument()
  })

  it('displays language names correctly with primary and non-primary format', () => {
    render(
      <SubtitleSelector
        selectedSubtitleId="lang-en"
        availableLanguages={mockYouTubeLanguages}
        onChange={jest.fn()}
      />
    )

    expect(screen.getByRole('combobox')).toHaveTextContent('English (Inglés)')
  })
})
