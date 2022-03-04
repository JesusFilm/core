import { MockedProvider } from '@apollo/client/testing'
import { render, fireEvent } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { EditToolbar } from '.'

describe('Edit Toolbar', () => {
  it('should render Toolbar', () => {
    const { getByRole, getAllByRole, getByTestId } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <EditToolbar />
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getAllByRole('button')[0]).toContainElement(
      getByTestId('DeleteOutlineRoundedIcon')
    )
    expect(getAllByRole('button')[1]).toContainElement(
      getByTestId('MoreVertIcon')
    )
    fireEvent.click(getAllByRole('button')[1])
    expect(getByRole('menu')).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Delete Card' })).toBeInTheDocument()
  })
})
