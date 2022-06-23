import { render } from '@testing-library/react'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { StatusChip } from '.'

describe('StatusChip', () => {
  it('should return chip for draft', () => {
    const { getByText, getByTestId } = render(
      <StatusChip status={JourneyStatus.draft} />
    )
    expect(getByText('Draft')).toBeInTheDocument()
    expect(getByTestId('EditIcon')).toBeInTheDocument()
  })

  it('should return chip for published', () => {
    const { getByText, getByTestId } = render(
      <StatusChip status={JourneyStatus.published} />
    )
    expect(getByText('Published')).toBeInTheDocument()
    expect(getByTestId('CheckCircleRoundedIcon')).toBeInTheDocument()
  })

  it('should return chip for archived', () => {
    const { getByText, getByTestId } = render(
      <StatusChip status={JourneyStatus.archived} />
    )
    expect(getByText('Archived')).toBeInTheDocument()
    expect(getByTestId('ArchiveRoundedIcon')).toBeInTheDocument()
  })

  it('should return chip for trashed', () => {
    const { getByText, getByTestId } = render(
      <StatusChip status={JourneyStatus.trashed} />
    )
    expect(getByText('Trash')).toBeInTheDocument()
    expect(getByTestId('CancelRoundedIcon')).toBeInTheDocument()
  })

  it('should return empty fragment if status is deleted', () => {
    const { container } = render(<StatusChip status={JourneyStatus.deleted} />)
    expect(container.firstChild).toBeNull()
  })
})
