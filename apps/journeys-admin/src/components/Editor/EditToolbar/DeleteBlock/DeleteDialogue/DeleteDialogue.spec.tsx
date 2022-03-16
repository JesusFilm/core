import { fireEvent, render } from '@testing-library/react'
import { DeleteDialogue } from '.'

describe('DeleteDialogue', () => {
  it('should, render the dialogue', () => {
    const { getByText, getByRole } = render(
      <DeleteDialogue
        handleDelete={jest.fn()}
        open={true}
        handleClose={jest.fn()}
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
    const handleClose = jest.fn()
    const { getByRole } = render(
      <DeleteDialogue
        handleDelete={jest.fn()}
        open={true}
        handleClose={handleClose}
      />
    )
    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    expect(handleClose).toHaveBeenCalled()
  })

  it('should call the delete function', () => {
    const handleDelete = jest.fn()
    const { getByRole } = render(
      <DeleteDialogue
        handleDelete={handleDelete}
        open={true}
        handleClose={jest.fn()}
      />
    )
    fireEvent.click(getByRole('button', { name: 'Delete' }))
    expect(handleDelete).toHaveBeenCalled()
  })
})
