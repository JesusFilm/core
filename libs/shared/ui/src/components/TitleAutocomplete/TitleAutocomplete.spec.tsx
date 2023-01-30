import { fireEvent, render } from '@testing-library/react'
import { AutocompleteRenderInputParams } from '@mui/material/Autocomplete'
import { ReactNode, HTMLAttributes } from 'react'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { TitleAutocomplete, Title } from '.'

describe('TitleAutocomplete', () => {
  const titles: Title[] = [
    {
      id: '2_GOJ4925-0-0',
      label: 'segment',
      title: [{ value: 'The Good Shepherd' }]
    },
    {
      id: '2_GOJ4927-0-0',
      label: 'segment',
      title: [{ value: 'Lazarus Dies' }]
    },
    {
      id: '2_GOJ4926-0-0',
      label: 'segment',
      title: [{ value: 'Are You Messiah?' }]
    }
  ]

  it('should sort title options alphabetically', async () => {
    const handleChange = jest.fn()
    const { getByRole, queryAllByRole } = render(
      <TitleAutocomplete
        onChange={handleChange}
        value={{
          id: '2_GOJ4927-0-0',
          label: 'segment',
          title: [{ value: 'Lazarus Dies' }]
        }}
        titles={titles}
        loading={false}
      />
    )
    fireEvent.focus(getByRole('combobox'))
    fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    expect(queryAllByRole('option')[0]).toHaveTextContent(
      'Are You Messiah?segment'
    )
    expect(queryAllByRole('option')[1]).toHaveTextContent('Lazarus Diessegment')
    expect(queryAllByRole('option')[2]).toHaveTextContent(
      'The Good Shepherdsegment'
    )
  })

  it('should select titles via option click', async () => {
    const handleChange = jest.fn()
    const { getByRole } = render(
      <TitleAutocomplete
        onChange={handleChange}
        value={{
          id: '2_GOJ4927-0-0',
          label: 'segment',
          title: [{ value: 'Lazarus Dies' }]
        }}
        titles={titles}
        loading={false}
      />
    )
    fireEvent.focus(getByRole('combobox'))
    fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    fireEvent.click(getByRole('option', { name: 'Lazarus Dies segment' }))
    expect(handleChange).toHaveBeenCalledWith({
      id: '2_GOJ4927-0-0',
      label: 'segment',
      title: [{ value: 'Lazarus Dies' }]
    })
  })

  it('should show loading animation if loading', async () => {
    const { getByRole } = render(
      <TitleAutocomplete
        onChange={jest.fn()}
        value={{
          id: '2_GOJ4927-0-0',
          label: 'segment',
          title: [{ value: 'Lazarus Dies' }]
        }}
        titles={titles}
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
      <TitleAutocomplete
        onChange={jest.fn()}
        value={{
          id: '2_GOJ4927-0-0',
          label: 'segment',
          title: [{ value: 'Lazarus Dies' }]
        }}
        titles={titles}
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
