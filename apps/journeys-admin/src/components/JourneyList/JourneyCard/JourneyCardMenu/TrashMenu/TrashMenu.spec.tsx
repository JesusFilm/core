import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'

import { TrashMenu } from '.'

describe('TrashMenu', () => {
  it('should render menu items', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <TrashMenu
            setOpenRestoreDialog={noop}
            setOpenDeleteDialog={noop}
            handleCloseMenu={noop}
          />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('menuitem', { name: 'Restore' })).toBeInTheDocument()
    expect(
      getByRole('menuitem', { name: 'Delete Forever' })
    ).toBeInTheDocument()
  })

  it('should call correct functions on Restore click', () => {
    const setOpenRestoreDialog = jest.fn()
    const handleCloseMenu = jest.fn()
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <TrashMenu
            setOpenRestoreDialog={setOpenRestoreDialog}
            setOpenDeleteDialog={noop}
            handleCloseMenu={handleCloseMenu}
          />
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('menuitem', { name: 'Restore' }))
    expect(setOpenRestoreDialog).toHaveBeenCalled()
    expect(handleCloseMenu).toHaveBeenCalled()
  })

  it('should call correct functions on Delete Forever click', () => {
    const setOpenDeleteDialog = jest.fn()
    const handleCloseMenu = jest.fn()
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <TrashMenu
            setOpenRestoreDialog={noop}
            setOpenDeleteDialog={setOpenDeleteDialog}
            handleCloseMenu={handleCloseMenu}
          />
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('menuitem', { name: 'Delete Forever' }))
    expect(setOpenDeleteDialog).toHaveBeenCalled()
    expect(handleCloseMenu).toHaveBeenCalled()
  })
})
