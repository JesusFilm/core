import { TFunction } from 'react-i18next'

import { GetVisitorEvents_visitor_events_ButtonClickEvent as ButtonEvent } from '../../../../../../__generated__/GetVisitorEvents'
import { ButtonAction } from '../../../../../../__generated__/globalTypes'

export function getButtonLabel(
  event: ButtonEvent,
  t: TFunction<'apps-journeys-admin', undefined>
): string {
  let res = ''
  switch (event.action) {
    case ButtonAction.NavigateAction:
      res = t('Next Card')
      break
    case ButtonAction.NavigateToBlockAction:
      res = t('Selected Card')
      break
    case ButtonAction.NavigateToJourneyAction:
      res = t('Journey')
      break
    case ButtonAction.LinkAction:
      if (event.actionValue != null) {
        res = event.actionValue
      }
      break
  }
  return res
}
