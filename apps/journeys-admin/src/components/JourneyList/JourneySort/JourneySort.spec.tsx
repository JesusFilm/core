import { render, fireEvent } from '@testing-library/react'
import { useState, ReactElement } from 'react'
import { SortOrder, JourneySort } from '.'

export const JourneySortMock = ({ ...args }): ReactElement => {
  const [sortOrder, setSortOrder] = useState<SortOrder>()
  return <JourneySort sortOrder={sortOrder} onChange={setSortOrder} {...args} />
}

describe('JourneyList/JourneySort', () => {
  it('should sort by date created by default', () => {
    const { getByRole, getByLabelText } = render(<JourneySortMock />)

    fireEvent.click(getByRole('button', { name: 'Sort By' }))

    expect(getByLabelText('Date Created')).toBeChecked()
  })

  it('should sort by name', async () => {
    const { getByRole, getByLabelText } = render(<JourneySortMock />)

    fireEvent.click(getByRole('button', { name: 'Sort By' }))
    fireEvent.click(getByLabelText('Name'))

    expect(getByRole('button', { name: 'Name' })).toBeInTheDocument()
  })

  it('should sort by date created', () => {
    const { getByRole, getByLabelText } = render(<JourneySortMock />)

    fireEvent.click(getByRole('button', { name: 'Sort By' }))
    fireEvent.click(getByLabelText('Name'))
    fireEvent.click(getByLabelText('Date Created'))

    const updatedButton = getByRole('button', { name: 'Date Created' })
    expect(updatedButton).toBeInTheDocument()
  })

  it('should not set sort value on cancel button click', () => {
    const { getByText, getByRole } = render(<JourneySortMock />)
    const button = getByRole('button', { name: 'Sort By' })

    fireEvent.click(button)
    fireEvent.click(getByText('Cancel'))

    expect(button).toBeInTheDocument()
  })

  it('should be disabled', () => {
    const { getByRole } = render(<JourneySortMock disabled={true} />)
    expect(getByRole('button', { name: 'Sort By' })).toHaveAttribute(
      'aria-disabled',
      'true'
    )
  })
})
