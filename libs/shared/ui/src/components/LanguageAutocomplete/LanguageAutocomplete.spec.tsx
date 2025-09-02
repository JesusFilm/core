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
      slug: 'french',
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
      slug: 'english',
      name: [
        {
          value: 'English',
          primary: true
        }
      ]
    },
    {
      id: '1106',
      slug: 'german-standard',
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
    },
    {
      id: '12693',
      slug: 'kankanay-tagakaulu',
      name: [
        {
          value: 'Kalagan, Tagakaulu',
          primary: false
        }
      ]
    },
    {
      id: '12696',
      slug: 'kankanay-northern',
      name: [
        {
          value: 'Kankanay, Northern',
          primary: false
        }
      ]
    },
    {
      id: '12714',
      slug: 'isnag',
      name: [
        {
          value: 'Isnag',
          primary: false
        }
      ]
    },
    {
      id: '12723',
      slug: 'ilocano',
      name: [
        {
          value: 'Ilokano',
          primary: true
        },
        {
          value: 'Ilocano',
          primary: false
        }
      ]
    },
    {
      id: '127283',
      slug: 'pogoro',
      name: [
        {
          value: 'Pogoro',
          primary: false
        }
      ]
    },
    {
      id: '12729',
      slug: 'ilongot',
      name: [
        {
          value: 'Ilongot',
          primary: false
        }
      ]
    },
    {
      id: '127397',
      slug: 'innu',
      name: [
        {
          value: 'Innu',
          primary: false
        }
      ]
    },
    {
      id: '12743',
      slug: 'ifugao-amganad',
      name: [
        {
          value: 'Ifugao, Amganad',
          primary: false
        }
      ]
    },
    {
      id: '12747',
      slug: 'ibaloi',
      name: [
        {
          value: 'Ibaloi',
          primary: false
        }
      ]
    },
    {
      id: '12750',
      slug: 'ibanag',
      name: [
        {
          value: 'Ibanag',
          primary: false
        }
      ]
    },
    {
      id: '1276',
      slug: 'kekchi',
      name: [
        {
          value: 'Kekchi',
          primary: false
        }
      ]
    },
    {
      id: '127670',
      slug: 'mundari-south-sudan',
      name: [
        {
          value: 'Mundari (South Sudan)',
          primary: false
        }
      ]
    },
    {
      id: '1277',
      slug: 'garifuna',
      name: [
        {
          value: 'Garifuna',
          primary: false
        }
      ]
    },
    {
      id: '12773',
      slug: 'cuyonon',
      name: [
        {
          value: 'Cuyonon',
          primary: false
        }
      ]
    },
    {
      id: '1278',
      slug: 'plautdietsch',
      name: [
        {
          value: 'Plautdietsch',
          primary: true
        },
        {
          value: 'Plautdietsch',
          primary: false
        }
      ]
    },
    {
      id: '12784',
      slug: 'cebuano',
      name: [
        {
          value: 'Sinugboanon',
          primary: true
        },
        {
          value: 'Cebuano',
          primary: false
        }
      ]
    },
    {
      id: '12791',
      slug: 'chavacano',
      name: [
        {
          value: 'Chavacano',
          primary: false
        }
      ]
    },
    {
      id: '1280',
      slug: 'aja-ggbe',
      name: [
        {
          value: 'Aja-Gbe',
          primary: false
        }
      ]
    },
    {
      id: '12801',
      slug: 'bantoanon',
      name: [
        {
          value: 'Bantoanon',
          primary: false
        }
      ]
    },
    {
      id: '12808',
      slug: 'balangao',
      name: [
        {
          value: 'Balangao',
          primary: false
        }
      ]
    },
    {
      id: '12815',
      slug: 'blaan-sarangani',
      name: [
        {
          value: 'Blaan, Sarangani',
          primary: false
        }
      ]
    },
    {
      id: '12816',
      slug: 'blaan-koronadal',
      name: [
        {
          value: 'Blaan, Koronadal',
          primary: false
        }
      ]
    },
    {
      id: '12839',
      slug: 'manobo-tagabawa',
      name: [
        {
          value: 'Manobo, Tagabawa',
          primary: false
        }
      ]
    },
    {
      id: '12853',
      slug: 'aklanon',
      name: [
        {
          value: 'Aklanon',
          primary: false
        }
      ]
    },
    {
      id: '12854',
      slug: 'binukid',
      name: [
        {
          value: 'Binukid',
          primary: false
        }
      ]
    },
    {
      id: '12869',
      slug: 'kashubian',
      name: [
        {
          value: 'Kaszëbsczi Jãzëk',
          primary: true
        },
        {
          value: 'Kashubian',
          primary: false
        }
      ]
    },
    {
      id: '12876',
      slug: 'ukrainian',
      name: [
        {
          value: 'Українська',
          primary: true
        },
        {
          value: 'Ukrainian',
          primary: false
        }
      ]
    },
    {
      id: '12923',
      slug: 'reunion-creole-french',
      name: [
        {
          value: 'Reunion Creole French',
          primary: false
        }
      ]
    },
    {
      id: '1294',
      slug: 'bariba',
      name: [
        {
          value: 'Bariba',
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
    expect(queryAllByRole('option')[0]).toHaveTextContent('Aja-Gbe')
    expect(queryAllByRole('option')[1]).toHaveTextContent('Aklanon')
    expect(queryAllByRole('option')[2]).toHaveTextContent('Balangao')
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
    fireEvent.click(getByRole('option', { name: 'Aja-Gbe' }))
    expect(handleChange).toHaveBeenCalledWith({
      id: '1280',
      slug: 'aja-ggbe',
      localName: 'Aja-Gbe',
      nativeName: undefined
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

    expect(getAllByTestId('test-option')).toHaveLength(10)
  })

  it('should have a virtualized list', () => {
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

    const listItems = getAllByTestId('test-option')
    expect(listItems).not.toHaveLength(languages.length)
  })
})
