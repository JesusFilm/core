import { fireEvent, render } from '@testing-library/react'

import { GetVideo_video_variantLanguages as Language } from '../../../../../__generated__/GetVideo'

import { VideoLanguage } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn(() => true)
}))

const languages: Language[] = [
  {
    __typename: 'Language',
    id: '529',
    name: [
      {
        value: 'English',
        primary: true,
        __typename: 'Translation'
      }
    ]
  },
  {
    id: '496',
    __typename: 'Language',
    name: [
      {
        value: 'Français',
        primary: true,
        __typename: 'Translation'
      },
      {
        value: 'French',
        primary: false,
        __typename: 'Translation'
      }
    ]
  },
  {
    id: '1106',
    __typename: 'Language',
    name: [
      {
        value: 'Deutsch',
        primary: true,
        __typename: 'Translation'
      },
      {
        value: 'German, Standard',
        primary: false,
        __typename: 'Translation'
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
    fireEvent.click(getByRole('button', { name: 'Close' }))
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
      nativeName: 'Français'
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
