import { fireEvent, render } from '@testing-library/react'
import { DeleteDialog } from '.'

describe('DeleteDialog', () => {
  const handleClose = jest.fn()
  const handleDelete = jest.fn()
  it('should, render the dialogue', () => {
    const { getByText, getByRole } = render(
      <DeleteDialog
        handleDelete={handleDelete}
        open={true}
        handleClose={handleClose}
      />
    )
    expect(getByText('Delete Card?')).toBeInTheDocument()
    expect(
      getByText('Are you sure you would like to delete this card?')
    ).toBeInTheDocument()
    expect(getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('it should call the close function', () => {
    const { getByRole } = render(
      <DeleteDialog
        handleDelete={handleDelete}
        open={true}
        handleClose={handleClose}
      />
    )
    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    expect(handleClose).toHaveBeenCalled()
  })

  it('should call the delete function', () => {
    const { getByRole } = render(
      <DeleteDialog
        handleDelete={handleDelete}
        open={true}
        handleClose={handleClose}
      />
    )
    fireEvent.click(getByRole('button', { name: 'Delete' }))
    expect(handleDelete).toHaveBeenCalled()
  })
})
