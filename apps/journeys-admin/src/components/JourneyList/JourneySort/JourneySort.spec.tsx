import { render, fireEvent } from '@testing-library/react'
import { SortBy } from '.'
import JourneySort from './JourneySort'
import { useState, ReactElement } from 'react'

export const JourneySortMock = (): ReactElement => {
  const [sortBy, setSortBy] = useState(SortBy.UNDEFINED)
  return <JourneySort sortBy={sortBy} setSortBy={setSortBy} />
}

describe('JourneySort', () => {
  it('should sort by date created by default', () => {
    const { getByRole, getByDisplayValue } = render(<JourneySortMock />)
    // Check chip label is "Sort By"
    const button = getByRole('button')
    const buttonSpan = button.querySelector('span')
    expect(buttonSpan).toHaveClass('MuiChip-label') // confirming that the button is the chip
    expect(buttonSpan?.textContent).toBe('Sort By')
    // open the sortBy form
    fireEvent.click(button)
    // Check radio option default value is "CREATED_AT"
    expect(getByDisplayValue('Date Created')).toBeChecked()
  })

  it('should sort by name', async () => {
    const { getByRole, getByLabelText } = render(<JourneySortMock />)
    // open the sort form
    fireEvent.click(getByRole('button'))

    const nameLabel = getByLabelText('Name')
    expect(nameLabel).not.toBeChecked()
    fireEvent.click(nameLabel)
    expect(nameLabel).toBeChecked()
    // Check Chip label has changed to Name
    const button = getByRole('button')
    const buttonSpan = button.querySelector('span')
    expect(buttonSpan).toHaveClass('MuiChip-label') // confirming that the button is the chip
    expect(buttonSpan?.textContent).toBe('Name')
  })

  it('should sort by date created', () => {
    const { getByRole, getByLabelText } = render(<JourneySortMock />)
    // open the sort form
    fireEvent.click(getByRole('button'))
    // fireEvent change value to dateCreated
    const dateCreatedLabel = getByLabelText('Date Created')
    fireEvent.click(dateCreatedLabel)
    expect(dateCreatedLabel).toBeChecked()

    const nameLabel = getByLabelText('Name')
    expect(nameLabel).not.toBeChecked()
    // fireEvent change to name then dateCreated
    fireEvent.click(nameLabel)
    expect(nameLabel).toBeChecked()
    fireEvent.click(dateCreatedLabel)
    expect(dateCreatedLabel).toBeChecked()

    // Check Chip label is now "Date Created"
    const button = getByRole('button')
    const buttonSpan = button.querySelector('span')
    expect(buttonSpan).toHaveClass('MuiChip-label') // confirming that the button is the chip
    expect(buttonSpan?.textContent).toBe('Date Created')
  })

  it('should not set sort value on cancel button click', () => {
    const { getByText, getByRole, queryByRole } = render(<JourneySortMock />)
    // open the sort form
    fireEvent.click(getByRole('button'))

    // Check that drawer has opened
    const drawer = getByRole('presentation')
    expect(drawer).toHaveAttribute('id', 'journeys-sort-drawer')
    expect(drawer).toBeInTheDocument()

    // click cancel
    const cancelButton = getByText('Cancel')
    fireEvent.click(cancelButton)

    // Since it's closed, the journeys-sort-drawer will now have aria-hidden=true property, so queryByRole will return null
    expect(queryByRole('presentation')).toBeNull()

    // Check Chip label is still "Sort By"
    const button = getByRole('button')
    const buttonSpan = button.querySelector('span')
    expect(buttonSpan).toHaveClass('MuiChip-label') // confirming that the button is the chip
    expect(buttonSpan?.textContent).toBe('Sort By')
  })
})
