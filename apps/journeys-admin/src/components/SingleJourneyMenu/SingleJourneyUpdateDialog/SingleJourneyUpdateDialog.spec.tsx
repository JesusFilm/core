import { render } from '@testing-library/react'
import SingleJourneyUpdateDialog, { UpdateJourneyFields } from '.'
import { defaultJourney } from '../../JourneyList/journeyListData'

const onClose = jest.fn()

describe('SingleJourneyUpdateDialog', () => {
  it('should update journey title on submit', () => {
    render(
      <SingleJourneyUpdateDialog
        field={UpdateJourneyFields.TITLE}
        open
        journey={defaultJourney}
        onClose={onClose}
      />
    )
    // simulate filling out form with fireEvents
    // check journeyUpdate mutation is called with correct parameters
  })

  it('should not set journey title on close', () => {
    render(
      <SingleJourneyUpdateDialog
        field={UpdateJourneyFields.TITLE}
        open
        journey={defaultJourney}
        onClose={onClose}
      />
    )
    // simulate filling out form with fireEvents
    // check onClose is called
  })

  it('should update journey description', () => {
    render(
      <SingleJourneyUpdateDialog
        field={UpdateJourneyFields.DESCRIPTION}
        open
        journey={defaultJourney}
        onClose={onClose}
      />
    )
    // simulate filling out form with fireEvents
    // check journeyUpdate mutation is called with correct parameters
  })

  it('should not set journey title on close', () => {
    render(
      <SingleJourneyUpdateDialog
        field={UpdateJourneyFields.DESCRIPTION}
        open
        journey={defaultJourney}
        onClose={onClose}
      />
    )
    // simulate filling out form with fireEvents
    // check onClose is called
  })
})
