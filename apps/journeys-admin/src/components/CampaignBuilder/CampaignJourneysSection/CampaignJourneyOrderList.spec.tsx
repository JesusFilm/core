import { fireEvent, render, screen } from '@testing-library/react'

import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { makeAdminJourney } from '../../../libs/campaignFields/campaignFixture'

import { CampaignJourneyOrderList } from './CampaignJourneyOrderList'

const journeys = [
  makeAdminJourney({ id: 'a', title: 'A' }),
  makeAdminJourney({ id: 'b', title: 'B', status: JourneyStatus.draft }),
  makeAdminJourney({ id: 'c', title: 'C' })
]

describe('CampaignJourneyOrderList', () => {
  it('renders nothing for an empty list', () => {
    const { container } = render(
      <CampaignJourneyOrderList journeys={[]} onChange={vi.fn()} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('moves items up and down and removes them', () => {
    const onChange = vi.fn()
    render(<CampaignJourneyOrderList journeys={journeys} onChange={onChange} />)

    expect(screen.getByRole('button', { name: 'Move A up' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Move C down' })).toBeDisabled()
    expect(screen.getByText('Draft')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Move B up' }))
    expect(onChange).toHaveBeenLastCalledWith(['b', 'a', 'c'])

    fireEvent.click(screen.getByRole('button', { name: 'Move A down' }))
    expect(onChange).toHaveBeenLastCalledWith(['b', 'a', 'c'])

    fireEvent.click(screen.getByRole('button', { name: 'Remove C' }))
    expect(onChange).toHaveBeenLastCalledWith(['a', 'b'])
  })
})
