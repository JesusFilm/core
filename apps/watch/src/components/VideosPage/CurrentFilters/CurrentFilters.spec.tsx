import { fireEvent, render } from '@testing-library/react'
import { noop } from 'lodash'
import { CurrentFilters } from '.'

describe('CurrentFilters', () => {
  const languages = [
    {
      id: '1',
      nativeName: 'English'
    },
    {
      id: '2',
      nativeName: 'French'
    },
    {
      id: '3',
      nativeName: 'Chinese'
    }
  ]

  it('should render filter chips', () => {
    const { getAllByRole } = render(
      <CurrentFilters languageFilters={languages} onDelete={noop} />
    )
    expect(getAllByRole('button')).toHaveLength(4)
  })

  it('should call onDelete', () => {
    const handleDelete = jest.fn()
    const { getAllByTestId } = render(
      <CurrentFilters languageFilters={languages} onDelete={handleDelete} />
    )
    fireEvent.click(getAllByTestId('CloseRoundedIcon')[0])
    expect(handleDelete).toHaveBeenCalled()
  })
})
