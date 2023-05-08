import { GetVisitorEvents_visitor_events_ButtonClickEvent as ButtonEvent } from '../../../../../../__generated__/GetVisitorEvents'
import { ButtonAction } from '../../../../../../__generated__/globalTypes'

export function getButtonLabel(event: ButtonEvent): string {
  let res = ''
  switch (event.action) {
    case ButtonAction.NavigateAction:
      res = 'Next Card'
      break
    case ButtonAction.NavigateToBlockAction:
      res = 'Selected Card'
      break
    case ButtonAction.NavigateToJourneyAction:
      res = 'Journey'
      break
    case ButtonAction.LinkAction:
      if (event.actionValue != null) {
        res = event.actionValue
      }
      break
  }
  return res
}
