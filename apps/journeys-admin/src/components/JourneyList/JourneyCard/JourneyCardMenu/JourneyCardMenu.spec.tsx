import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../ThemeProvider'
import { JourneyCardMenu } from '.'

describe('JourneyCardMenu', () => {
  it('should open default menu on click', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <ThemeProvider>
            <JourneyCardMenu
              status={JourneyStatus.published}
              slug={'published-journey'}
              published={true}
              journeyId={'journey-id'}
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
    expect(getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Access' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Preview' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Archive' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument()
  })

  it('should open trash menu on click', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <ThemeProvider>
            <JourneyCardMenu
              status={JourneyStatus.trashed}
              slug={'published-journey'}
              published={true}
              journeyId={'journey-id'}
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
    expect(getByRole('menuitem', { name: 'Restore' })).toBeInTheDocument()
    expect(
      getByRole('menuitem', { name: 'Delete Forever' })
    ).toBeInTheDocument()
  })

  it('should show access dialog on click', async () => {
    const { getByRole, queryByText, getByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <ThemeProvider>
            <JourneyCardMenu
              status={JourneyStatus.draft}
              slug={'draft-journey'}
              published={false}
              journeyId={'journey-id'}
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

  it('should show trash dialog on click', async () => {
    const { getByRole, queryByText, getByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <ThemeProvider>
            <JourneyCardMenu
              status={JourneyStatus.draft}
              slug={'draft-journey'}
              published={false}
              journeyId={'journey-id'}
            />
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    fireEvent.click(getByRole('menuitem', { name: 'Delete' }))

    expect(queryByText('Delete Journey?')).toBeInTheDocument()
    fireEvent.click(getByTestId('dialog-close-button'))
    await waitFor(() =>
      expect(queryByText('Delete Journey?')).not.toBeInTheDocument()
    )
  })

  it('should show restore dialog on click', async () => {
    const { getByRole, queryByText, getByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <ThemeProvider>
            <JourneyCardMenu
              status={JourneyStatus.trashed}
              slug={'trashed-journey'}
              published={false}
              journeyId={'journey-id'}
            />
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    fireEvent.click(getByRole('menuitem', { name: 'Restore' }))

    expect(queryByText('Restore Journey?')).toBeInTheDocument()
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
              status={JourneyStatus.trashed}
              slug={'trashed-journey'}
              published={false}
              journeyId={'journey-id'}
            />
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    fireEvent.click(getByRole('menuitem', { name: 'Delete Forever' }))

    expect(queryByText('Delete Forever?')).toBeInTheDocument()
    fireEvent.click(getByTestId('dialog-close-button'))
    await waitFor(() =>
      expect(queryByText('Delete Forever?')).not.toBeInTheDocument()
    )
  })
})
