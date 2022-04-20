import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { EditToolbar } from '.'

describe('Edit Toolbar', () => {
  jest.mock('@mui/material/useMediaQuery', () => ({
    __esModule: true,
    default: () => true
  }))
  it('should render Toolbar', () => {
    const { getAllByRole, getByTestId } = render(
      <SnackbarProvider>
        <MockedProvider>
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
  })
})
