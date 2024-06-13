import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { TeamProvider } from '../../../Team/TeamProvider'
import { ThemeProvider } from '../../../ThemeProvider'

import { JourneyCardMenu } from '.'

describe('JourneyCardMenu', () => {
  it('should open default menu on click', async () => {
    const { getByRole } = render(
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
    expect(getByRole('menu')).toHaveAttribute(
      'aria-labelledby',
      'journey-actions'
    )
    await waitFor(() =>
      expect(getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
    )
    expect(getByRole('menuitem', { name: 'Access' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Preview' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Archive' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Trash' })).toBeInTheDocument()
  })

  it('should open trash menu on click', async () => {
    const { getByRole } = render(
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
    expect(getByRole('menu')).toHaveAttribute(
      'aria-labelledby',
      'journey-actions'
    )
    await waitFor(() =>
      expect(getByRole('menuitem', { name: 'Restore' })).toBeInTheDocument()
    )
    expect(
      getByRole('menuitem', { name: 'Delete Forever' })
    ).toBeInTheDocument()
  })

  it('should show access dialog on click', async () => {
    const { getByRole, queryByText, getByTestId } = render(
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
    const { getByRole, queryByText, getByTestId } = render(
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
    fireEvent.click(getByRole('menuitem', { name: 'Trash' }))

    await waitFor(() =>
      expect(queryByText('Trash Journey?')).toBeInTheDocument()
    )
    fireEvent.click(getByTestId('dialog-close-button'))
    await waitFor(() =>
      expect(queryByText('Trash Journey?')).not.toBeInTheDocument()
    )
  })

  it('should show restore dialog on click', async () => {
    const { getByRole, queryByText, getByTestId } = render(
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
    fireEvent.click(getByRole('menuitem', { name: 'Restore' }))

    await waitFor(() =>
      expect(queryByText('Restore Journey?')).toBeInTheDocument()
    )
    fireEvent.click(getByTestId('dialog-close-button'))
    await waitFor(() =>
      expect(queryByText('Restore Journey?')).not.toBeInTheDocument()
    )
  })

  it('should show delete forever dialog on click', async () => {
    const { getByRole, queryByText, getByTestId } = render(
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
    fireEvent.click(getByRole('menuitem', { name: 'Delete Forever' }))

    await waitFor(() =>
      expect(queryByText('Delete Forever?')).toBeInTheDocument()
    )
    fireEvent.click(getByTestId('dialog-close-button'))
    await waitFor(() =>
      expect(queryByText('Delete Forever?')).not.toBeInTheDocument()
    )
  })
})
