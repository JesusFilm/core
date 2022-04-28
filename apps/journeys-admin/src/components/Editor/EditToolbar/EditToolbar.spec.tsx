import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { JourneyProvider } from '../../../libs/context'
import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { EditToolbar } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))
describe('Edit Toolbar', () => {
  it('should render Toolbar', () => {
    const { getAllByRole, getByTestId } = render(
      <SnackbarProvider>
        <MockedProvider>
          <EditToolbar />
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(
      getAllByRole('button', { name: 'Delete Block Actions' })[0]
    ).toContainElement(getByTestId('DeleteOutlineRoundedIcon'))
    expect(
      getAllByRole('button', { name: 'Edit Journey Actions' })[0]
    ).toContainElement(getByTestId('MoreVertIcon'))
  })

  it('should render Preview Button', () => {
    const { getAllByRole, getByTestId } = render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider
            value={{ slug: 'untitled-journey' } as unknown as Journey}
          >
            <EditToolbar />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    const button = getAllByRole('link', { name: 'Preview' })[0]
    expect(button).toContainElement(getByTestId('VisibilityIcon'))
    expect(button).toHaveAttribute('href', '/api/preview?slug=untitled-journey')
    expect(button).not.toBeDisabled()
  })
})
