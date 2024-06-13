import { fireEvent, render } from '@testing-library/react'

import { Language, MultipleLanguageAutocomplete } from '.'

describe('LanguageAutocomplete', () => {
  const languages: Language[] = [
    {
      id: '496',
      name: [
        {
          value: 'Français',
          primary: true
        },
        {
          value: 'French',
          primary: false
        }
      ]
    },
    {
      id: '529',
      name: [
        {
          value: 'English',
          primary: true
        }
      ]
    },
    {
      id: '1106',
      name: [
        {
          value: 'Deutsch',
          primary: true
        },
        {
          value: 'German, Standard',
          primary: false
        }
      ]
    }
  ]

  it('should sort language options alphabetically', async () => {
    const handleChange = jest.fn()
    const { getByRole, queryAllByRole } = render(
      <MultipleLanguageAutocomplete
        onChange={handleChange}
        values={[{ id: '529', localName: undefined, nativeName: 'English' }]}
        languages={languages}
        loading={false}
      />
    )
    fireEvent.focus(getByRole('combobox'))
    fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    expect(queryAllByRole('option')[0]).toHaveTextContent('English')
    expect(queryAllByRole('option')[1]).toHaveTextContent('FrenchFrançais')
    expect(queryAllByRole('option')[2]).toHaveTextContent(
      'German, StandardDeutsch'
    )
  })

  it('should enable multiple language select via option click', async () => {
    const handleChange = jest.fn()
    const { getByRole } = render(
      <MultipleLanguageAutocomplete
        onChange={handleChange}
        values={[]}
        languages={languages}
        loading={false}
      />
    )
    fireEvent.focus(getByRole('combobox'))
    fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    fireEvent.click(getByRole('option', { name: 'French Français' }))
    expect(handleChange).toHaveBeenCalledWith([
      {
        id: '496',
        localName: 'French',
        nativeName: 'Français'
      }
    ])
  })

  it('should enable users to enter custom text and get related options', async () => {
    const handleChange = jest.fn()
    const { getByRole, queryByRole } = render(
      <MultipleLanguageAutocomplete
        onChange={handleChange}
        values={[]}
        languages={[
          ...languages,
          {
            id: '20615',
            name: [
              {
                value: '普通話 ',
                primary: true
              },
              {
                value: 'Chinese, Mandarin',
                primary: false
              }
            ]
          }
        ]}
        loading={false}
      />
    )
    const combobox = getByRole('combobox')
    fireEvent.focus(combobox)
    fireEvent.change(combobox, {
      target: { value: '普通話 ' }
    })
    expect(
      queryByRole('option', { name: 'French Français' })
    ).not.toBeInTheDocument()
    fireEvent.click(getByRole('option', { name: 'Chinese, Mandarin 普通話' }))
    expect(handleChange).toHaveBeenCalledWith([
      {
        id: '20615',
        localName: 'Chinese, Mandarin',
        nativeName: '普通話 '
      }
    ])
  })

  it('should show loading animation if loading', async () => {
    const { getByRole } = render(
      <MultipleLanguageAutocomplete
        onChange={jest.fn()}
        values={[{ id: '529', localName: undefined, nativeName: 'English' }]}
        languages={languages}
        loading
      />
    )
    expect(getByRole('progressbar')).toBeInTheDocument()
  })

  it('should call onBlur on blur', async () => {
    const onBlur = jest.fn()
    const { getByRole } = render(
      <MultipleLanguageAutocomplete
        onChange={jest.fn()}
        onBlur={onBlur}
        values={[{ id: '529', localName: undefined, nativeName: 'English' }]}
        languages={languages}
        loading={false}
      />
    )
    fireEvent.focus(getByRole('combobox'))
    fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    fireEvent.click(getByRole('option', { name: 'French Français' }))
    fireEvent.blur(getByRole('combobox'))
    expect(onBlur).toHaveBeenCalled()
  })
})
