import { GetVisitorEvents_visitor_events_ButtonClickEvent as ButtonEvent } from '../../../../../../__generated__/GetVisitorEvents'
import { ButtonAction } from '../../../../../../__generated__/globalTypes'

import { getButtonLabel } from '.'

describe('getButtonLabel', () => {
  const t = (string): string => string
  const buttonEvent: ButtonEvent = {
    __typename: 'ButtonClickEvent',
    id: 'buttonClick.id',
    journeyId: 'journey.id',
    label: 'button label',
    value: 'button value',
    createdAt: '2022-11-02T03:20:06.368Z',
    action: null,
    actionValue: null
  }

  it('should return label for NavigateAction', () => {
    const result = getButtonLabel(
      {
        ...buttonEvent,
        action: ButtonAction.NavigateAction,
        actionValue: null
      },
      t
    )
    expect(result).toEqual('Next Card')
  })

  it('should return label for NavigateToBlockAction', () => {
    const result = getButtonLabel(
      {
        ...buttonEvent,
        action: ButtonAction.NavigateToBlockAction,
        actionValue: 'Next step name'
      },
      t
    )
    expect(result).toEqual('Selected Card')
  })

  it('should return label for NavigateToJourneyAction', () => {
    const result = getButtonLabel(
      {
        ...buttonEvent,
        action: ButtonAction.NavigateToJourneyAction,
        actionValue: 'Journey name'
      },
      t
    )
    expect(result).toEqual('Journey')
  })

  it('should return label for LinkAction', () => {
    const result = getButtonLabel(
      {
        ...buttonEvent,
        action: ButtonAction.LinkAction,
        actionValue: 'https://google.com'
      },
      t
    )
    expect(result).toEqual('https://google.com')
  })
})
