import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../ThemeProvider'
import { JourneyCardMenu } from '.'

describe('JourneyCardMenu', () => {
  it('should open menu on click', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <ThemeProvider>
            <JourneyCardMenu
              status={JourneyStatus.published}
              slug={'published-journey'}
            />
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByRole('button')).toHaveAttribute(
      'aria-controls',
      'journey-actions'
    )
    expect(getByRole('button')).toHaveAttribute('aria-haspopup', 'true')
    expect(getByRole('button')).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(getByRole('button'))
    expect(getByRole('menu')).toHaveAttribute(
      'aria-labelledby',
      'journey-actions'
    )
  })
  it('should handle edit journey', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <ThemeProvider>
            <JourneyCardMenu
              status={JourneyStatus.published}
              slug={'published-journey'}
            />
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    expect(getByRole('menuitem', { name: 'Edit' })).toHaveAttribute(
      'href',
      '/journeys/published-journey'
    )
  })
  it('should handle preview', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <ThemeProvider>
            <JourneyCardMenu
              status={JourneyStatus.published}
              slug={'published-journey'}
            />
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    expect(getByRole('menuitem', { name: 'Preview' })).toHaveAttribute(
      'href',
      'https://your.nextstep.is/published-journey'
    )
  })

  it('should have a disabled preview button is journey is draft', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <ThemeProvider>
            <JourneyCardMenu
              status={JourneyStatus.draft}
              slug={'draft-journey'}
            />
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    expect(getByRole('menuitem', { name: 'Preview' })).toHaveAttribute(
      'aria-disabled'
    )
  })

  it('should show access dialog on click', async () => {
    const { getByRole, queryByText, getByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <ThemeProvider>
            <JourneyCardMenu
              status={JourneyStatus.draft}
              slug={'draft-journey'}
            />
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    fireEvent.click(getByRole('menuitem', { name: 'Access' }))

    expect(queryByText('Invite Other Editors')).toBeInTheDocument()
    fireEvent.click(getByTestId('dialog-close-button'))
    await waitFor(() =>
      expect(queryByText('Invite Other Editors')).not.toBeInTheDocument()
    )
  })
})
