import { fireEvent, render } from '@testing-library/react'
import { LanguageFields } from './__generated__/LanguageFields'
import { LanguageSelect } from '.'

describe('LanguageSelect', () => {
  const languages: LanguageFields[] = [
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

  it('should sort language options alphabetically', async () => {
    const handleChange = jest.fn()
    const { getByRole, queryAllByRole } = render(
      <LanguageSelect
        onChange={handleChange}
        value={{ id: '529', localName: undefined, nativeName: 'English' }}
        languages={languages}
        loading={false}
      />
    )
    fireEvent.focus(getByRole('textbox'))
    fireEvent.keyDown(getByRole('textbox'), { key: 'ArrowDown' })
    expect(queryAllByRole('option')[0]).toHaveTextContent('English')
    expect(queryAllByRole('option')[1]).toHaveTextContent('French')
    expect(queryAllByRole('option')[2]).toHaveTextContent('German')
  })

  it('should select languages via option click', async () => {
    const handleChange = jest.fn()
    const { getByRole } = render(
      <LanguageSelect
        onChange={handleChange}
        value={{ id: '529', localName: undefined, nativeName: 'English' }}
        languages={languages}
        loading={false}
      />
    )
    fireEvent.focus(getByRole('textbox'))
    fireEvent.keyDown(getByRole('textbox'), { key: 'ArrowDown' })
    fireEvent.click(getByRole('option', { name: 'French Français' }))
    expect(handleChange).toHaveBeenCalledWith({
      id: '496',
      localName: 'French',
      nativeName: 'Français'
    })
  })

  it('should set default value', async () => {
    const { getByRole } = render(
      <LanguageSelect
        onChange={jest.fn()}
        value={{
          id: '1106',
          localName: 'German, Standard',
          nativeName: 'Deutsch'
        }}
        languages={languages}
        loading={false}
      />
    )
    expect(getByRole('textbox')).toHaveValue('German, Standard')
  })

  it('should show loading animation if loading', async () => {
    const { getByRole } = render(
      <LanguageSelect
        onChange={jest.fn()}
        value={{ id: '529', localName: undefined, nativeName: 'English' }}
        languages={languages}
        loading
      />
    )
    expect(getByRole('progressbar')).toBeInTheDocument()
  })
})
