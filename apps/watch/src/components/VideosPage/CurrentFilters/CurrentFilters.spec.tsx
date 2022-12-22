import { fireEvent, render } from '@testing-library/react'
import { noop } from 'lodash'
import { filter, languages } from '../testData'
import { CurrentFilters } from '.'

describe('CurrentFilters', () => {
  it('should render filter chips', () => {
    const { getAllByRole } = render(
      <CurrentFilters languages={languages} filter={filter} onDelete={noop} />
    )
    expect(getAllByRole('button')).toHaveLength(4)
  })

  it('should call onDelete', () => {
    const handleDelete = jest.fn()
    const { getAllByTestId } = render(
      <CurrentFilters
        languages={languages}
        filter={filter}
        onDelete={handleDelete}
      />
    )
    fireEvent.click(getAllByTestId('CloseRoundedIcon')[0])
    expect(handleDelete).toHaveBeenCalled()
  })
})
