import { fireEvent, render } from '@testing-library/react'
import { CurrentFilters } from '.'

describe('CurrentFilters', () => {
  it('should render filter chips', () => {
    const { getByRole } = render(
      <CurrentFilters
        audioLanguages={{
          value: ['Language1', 'Language2'],
          onDelete: jest.fn()
        }}
        subtitleLanguages={{ value: ['Subtitle1'], onDelete: jest.fn() }}
      />
    )
    expect(
      getByRole('button', { name: 'audio: Language1' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'audio: Language2' })
    ).toBeInTheDocument()
    expect(getByRole('button', { name: 'sub: Subtitle1' })).toBeInTheDocument()
  })

  it('should call onDelete on audio chip delete', () => {
    const handleDelete = jest.fn()
    const setCustomFilter = jest.fn()
    const { getByTestId } = render(
      <CurrentFilters
        audioLanguages={{
          value: ['Language1', 'Language2'],
          onDelete: () =>
            handleDelete({ field: 'custom field', setFilter: setCustomFilter })
        }}
        subtitleLanguages={{ value: ['Subtitle1'], onDelete: handleDelete }}
      />
    )
    fireEvent.click(getByTestId('delete audio Language1 filter'))
    expect(handleDelete).toHaveBeenCalledWith({
      field: 'custom field',
      setFilter: setCustomFilter
    })
  })

  it('should call onDelete on subtitle chip delete', () => {
    const handleDelete = jest.fn()
    const setCustomFilter = jest.fn()
    const { getByTestId } = render(
      <CurrentFilters
        audioLanguages={{
          value: ['Language1', 'Language2'],
          onDelete: handleDelete
        }}
        subtitleLanguages={{
          value: ['Subtitle1'],
          onDelete: () =>
            handleDelete({ field: 'custom field', setFilter: setCustomFilter })
        }}
      />
    )
    fireEvent.click(getByTestId('delete subtitle Subtitle1 filter'))
    expect(handleDelete).toHaveBeenCalledWith({
      field: 'custom field',
      setFilter: setCustomFilter
    })
  })
})
