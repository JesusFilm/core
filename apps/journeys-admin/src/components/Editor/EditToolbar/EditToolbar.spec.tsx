import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { JourneyStatus } from '../../../../__generated__/globalTypes'

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
            value={{
              journey: { slug: 'untitled-journey' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditToolbar />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    const button = getAllByRole('link', { name: 'Preview' })[0]
    expect(button).toContainElement(getByTestId('VisibilityIcon'))
    expect(button).toHaveAttribute('href', '/api/preview?slug=untitled-journey')
    expect(button).toHaveAttribute('target', '_blank')
    expect(button).not.toBeDisabled()
  })

  it('should render preview button as disabled when journey status is draft', () => {
    const { getAllByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: {
                slug: 'untitled-journey',
                status: JourneyStatus.draft
              } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditToolbar />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    const button = getAllByRole('link', { name: 'Preview' })[0]
    expect(button).toHaveAttribute('aria-disabled', 'true')
  })
})
