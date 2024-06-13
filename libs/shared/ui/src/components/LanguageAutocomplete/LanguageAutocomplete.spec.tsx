import { AutocompleteRenderInputParams } from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { fireEvent, render } from '@testing-library/react'
import { HTMLAttributes, ReactNode } from 'react'

import { Language, LanguageAutocomplete } from '.'

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
      <LanguageAutocomplete
        onChange={handleChange}
        value={{ id: '529', localName: undefined, nativeName: 'English' }}
        languages={languages}
        loading={false}
      />
    )
    fireEvent.focus(getByRole('combobox'))
    fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    expect(queryAllByRole('option')[0]).toHaveTextContent('English')
    expect(queryAllByRole('option')[1]).toHaveTextContent('French')
    expect(queryAllByRole('option')[2]).toHaveTextContent('German')
  })

  it('should select languages via option click', async () => {
    const handleChange = jest.fn()
    const { getByRole } = render(
      <LanguageAutocomplete
        onChange={handleChange}
        value={{ id: '529', localName: undefined, nativeName: 'English' }}
        languages={languages}
        loading={false}
      />
    )
    fireEvent.focus(getByRole('combobox'))
    fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    fireEvent.click(getByRole('option', { name: 'French Français' }))
    expect(handleChange).toHaveBeenCalledWith({
      id: '496',
      localName: 'French',
      nativeName: 'Français'
    })
  })

  it('should accept helper text', async () => {
    const { getByText } = render(
      <LanguageAutocomplete
        onChange={jest.fn()}
        value={{
          id: '1106',
          localName: 'German, Standard',
          nativeName: 'Deutsch'
        }}
        languages={languages}
        loading={false}
        helperText="Set the language of your journey"
      />
    )
    expect(getByText('Set the language of your journey')).toBeInTheDocument()
  })

  it('should set default value', async () => {
    const { getByRole } = render(
      <LanguageAutocomplete
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
    expect(getByRole('combobox')).toHaveValue('German, Standard')
  })

  it('should show loading animation if loading', async () => {
    const { getByRole } = render(
      <LanguageAutocomplete
        onChange={jest.fn()}
        value={{ id: '529', localName: undefined, nativeName: 'English' }}
        languages={languages}
        loading
      />
    )
    expect(getByRole('progressbar')).toBeInTheDocument()
  })

  it('should render with custom render input and render option', () => {
    const renderInput = (params: AutocompleteRenderInputParams): ReactNode => (
      <TextField
        {...params}
        InputProps={{
          ...params.InputProps
        }}
        data-testid="test-input"
      />
    )

    const renderOption = (props: HTMLAttributes<HTMLLIElement>): ReactNode => (
      <li {...props} data-testid="test-option">
        <Typography>hello world</Typography>
      </li>
    )
    const { getAllByTestId, getByTestId, getByRole } = render(
      <LanguageAutocomplete
        onChange={jest.fn()}
        value={{ id: '529', localName: undefined, nativeName: 'English' }}
        languages={languages}
        loading={false}
        renderInput={renderInput}
        renderOption={renderOption}
      />
    )

    expect(getByTestId('test-input')).toBeInTheDocument()

    fireEvent.focus(getByRole('combobox'))
    fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })

    expect(getAllByTestId('test-option')).toHaveLength(3)
  })
})
