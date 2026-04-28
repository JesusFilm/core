import { fireEvent, render } from '@testing-library/react'

import { GetVideo_video_variantLanguages as Language } from '../../../../../../../../__generated__/GetVideo'

import { VideoLanguagePicker } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn(() => true)
}))

const languages: Language[] = [
  {
    __typename: 'Language',
    id: '529',
    slug: 'english',
    name: [
      {
        value: 'English',
        primary: true,
        __typename: 'LanguageName'
      }
    ]
  },
  {
    id: '496',
    __typename: 'Language',
    slug: 'french',
    name: [
      {
        value: 'Français',
        primary: true,
        __typename: 'LanguageName'
      },
      {
        value: 'French',
        primary: false,
        __typename: 'LanguageName'
      }
    ]
  },
  {
    id: '1106',
    __typename: 'Language',
    slug: 'german-standard',
    name: [
      {
        value: 'Deutsch',
        primary: true,
        __typename: 'LanguageName'
      },
      {
        value: 'German, Standard',
        primary: false,
        __typename: 'LanguageName'
      }
    ]
  }
]

const handleChange = jest.fn()

describe('VideoLanguagePicker', () => {
  beforeEach(() => {
    handleChange.mockClear()
  })

  it('should render the autocomplete with the current language', () => {
    const { getByRole, getByText } = render(
      <VideoLanguagePicker
        onChange={handleChange}
        language={{ id: '529', localName: undefined, nativeName: 'English' }}
        languages={languages}
        loading={false}
      />
    )
    expect(getByText('Available Languages')).toBeInTheDocument()
    expect(getByRole('combobox')).toHaveValue('English')
  })

  it('should call onChange when a language is selected', () => {
    const { getByRole } = render(
      <VideoLanguagePicker
        onChange={handleChange}
        language={{ id: '529', localName: undefined, nativeName: 'English' }}
        languages={languages}
        loading={false}
      />
    )

    fireEvent.focus(getByRole('combobox'))
    fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    fireEvent.click(getByRole('option', { name: 'French Français' }))
    expect(handleChange).toHaveBeenCalledWith({
      __typename: 'Language',
      id: '496',
      localName: 'French',
      nativeName: 'Français',
      slug: 'french'
    })
  })
})
