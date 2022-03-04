import { MockedProvider } from '@apollo/client/testing'
import { render, fireEvent } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { Menu } from '.'

describe('EditToolbar Menu', () => {
  it('should render the menu on icon click', () => {
    const { getByRole, getByTestId } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <Menu />
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('button')).toContainElement(getByTestId('MoreVertIcon'))
    fireEvent.click(getByRole('button'))
    expect(getByRole('menu')).toBeInTheDocument()
  })
})
