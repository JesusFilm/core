import { fireEvent, render } from '@testing-library/react'

import { JourneyStatusFilter } from '.'

describe('JourneyList/JourneyStatusFilter', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render with Active as default status', () => {
    const { getByRole } = render(
      <JourneyStatusFilter onChange={mockOnChange} />
    )

    const button = getByRole('button', { name: 'Filter by status' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Active')
  })

  it('should open options when clicked', () => {
    const { getByRole, getByLabelText } = render(
      <JourneyStatusFilter onChange={mockOnChange} />
    )

    fireEvent.click(getByRole('button', { name: 'Filter by status' }))

    expect(getByLabelText('Active')).toBeInTheDocument()
    expect(getByLabelText('Archived')).toBeInTheDocument()
    expect(getByLabelText('Trash')).toBeInTheDocument()
  })

  it('should call onChange when a status option is selected', () => {
    const { getByRole, getByLabelText } = render(
      <JourneyStatusFilter status="active" onChange={mockOnChange} />
    )

    fireEvent.click(getByRole('button', { name: 'Filter by status' }))
    fireEvent.click(getByLabelText('Archived'))

    expect(mockOnChange).toHaveBeenCalledWith('archived')
  })
})
