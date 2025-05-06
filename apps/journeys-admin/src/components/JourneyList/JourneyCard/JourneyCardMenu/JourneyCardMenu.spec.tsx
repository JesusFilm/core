import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { TeamProvider } from '@core/journeys/ui/TeamProvider'

import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../ThemeProvider'

import { JourneyCardMenu } from '.'

describe('JourneyCardMenu', () => {
  it('should open default menu on click', async () => {
    const { getByRole, findByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <TeamProvider>
            <ThemeProvider>
              <JourneyCardMenu
                id="journeyId"
                status={JourneyStatus.published}
                slug="published-journey"
                published
              />
            </ThemeProvider>
          </TeamProvider>
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

    await findByRole('menuitem', { name: 'Edit Details' })
    await findByRole('menuitem', { name: 'Access' })
    await findByRole('menuitem', { name: 'Preview' })
    await findByRole('menuitem', { name: 'Archive' })
    await findByRole('menuitem', { name: 'Trash' })
  })

  it('should open trash menu on click', async () => {
    const { getByRole, findByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <ThemeProvider>
            <JourneyCardMenu
              id="journeyId"
              status={JourneyStatus.trashed}
              slug="trashed-journey"
              published={false}
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

    await findByRole('menuitem', { name: 'Restore' })
    await findByRole('menuitem', { name: 'Delete Forever' })
  })

  it('should show access dialog on click', async () => {
    const { getByRole, findByRole, queryByText, getByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <TeamProvider>
            <ThemeProvider>
              <JourneyCardMenu
                id="journeyId"
                status={JourneyStatus.draft}
                slug="draft-journey"
                published={false}
              />
            </ThemeProvider>
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    await findByRole('menuitem', { name: 'Access' })
    fireEvent.click(getByRole('menuitem', { name: 'Access' }))

    await waitFor(() =>
      expect(queryByText('Manage Editors')).toBeInTheDocument()
    )
    fireEvent.click(getByTestId('dialog-close-button'))
    await waitFor(() =>
      expect(queryByText('Manage Editors')).not.toBeInTheDocument()
    )
  })

  it('should show trash dialog on click', async () => {
    const { getByRole, findByRole, queryByText, getByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <TeamProvider>
            <ThemeProvider>
              <JourneyCardMenu
                id="journeyId"
                status={JourneyStatus.draft}
                slug="draft-journey"
                published={false}
              />
            </ThemeProvider>
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    fireEvent.click(await findByRole('menuitem', { name: 'Trash' }))

    await waitFor(() =>
      expect(queryByText('Trash Journey?')).toBeInTheDocument()
    )
    fireEvent.click(getByTestId('dialog-close-button'))
    await waitFor(() =>
      expect(queryByText('Trash Journey?')).not.toBeInTheDocument()
    )
  })

  it('should show restore dialog on click', async () => {
    const { getByRole, findByRole, queryByText, getByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <ThemeProvider>
            <JourneyCardMenu
              id="journeyId"
              status={JourneyStatus.trashed}
              slug="trashed-journey"
              published={false}
            />
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    fireEvent.click(await findByRole('menuitem', { name: 'Restore' }))

    await waitFor(() =>
      expect(queryByText('Restore Journey?')).toBeInTheDocument()
    )
    fireEvent.click(getByTestId('dialog-close-button'))
    await waitFor(() =>
      expect(queryByText('Restore Journey?')).not.toBeInTheDocument()
    )
  })

  it('should show delete forever dialog on click', async () => {
    const { getByRole, findByRole, queryByText, getByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <ThemeProvider>
            <JourneyCardMenu
              id="journeyId"
              status={JourneyStatus.trashed}
              slug="trashed-journey"
              published={false}
            />
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    fireEvent.click(await findByRole('menuitem', { name: 'Delete Forever' }))

    await waitFor(() =>
      expect(queryByText('Delete Forever?')).toBeInTheDocument()
    )
    fireEvent.click(getByTestId('dialog-close-button'))
    await waitFor(() =>
      expect(queryByText('Delete Forever?')).not.toBeInTheDocument()
    )
  })
})
