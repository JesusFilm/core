import { fireEvent, render } from '@testing-library/react'

import { GetVideo_video_variantLanguages as Language } from '../../../../../../../../__generated__/GetVideo'

import { VideoLanguage } from '.'

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
const handleClose = jest.fn()

describe('VideoLanguage', () => {
  it('should call onClose when closed', () => {
    const { getByRole } = render(
      <VideoLanguage
        open
        onClose={handleClose}
        onChange={handleChange}
        language={{ id: '529', localName: undefined, nativeName: 'English' }}
        languages={languages}
        loading={false}
      />
    )
    fireEvent.click(getByRole('button', { name: 'close-image-library' }))
    expect(handleClose).toHaveBeenCalled()
  })

  it('should select language', () => {
    const { getByRole } = render(
      <VideoLanguage
        open
        onClose={handleClose}
        onChange={handleChange}
        language={{ id: '529', localName: undefined, nativeName: 'English' }}
        languages={languages}
        loading={false}
      />
    )

    expect(getByRole('combobox')).toHaveValue('English')
    fireEvent.focus(getByRole('combobox'))
    fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    fireEvent.click(getByRole('option', { name: 'French Français' }))
    expect(handleChange).toHaveBeenCalledWith({
      id: '496',
      localName: 'French',
      nativeName: 'Français',
      slug: 'french'
    })
  })

  it('should call onClose when Apply clicked', async () => {
    const { getByRole } = render(
      <VideoLanguage
        open
        onClose={handleClose}
        onChange={handleChange}
        language={{ id: '529', localName: undefined, nativeName: 'English' }}
        languages={languages}
        loading={false}
      />
    )
    fireEvent.click(getByRole('button', { name: 'Apply' }))
    expect(handleClose).toHaveBeenCalled()
  })
})
