import type { TreeBlock } from '@core/journeys/ui/block'

import type { MetaAction, MetaActionType } from '../metaActions'
import { metaActions } from '../metaActions'

export function getFilteredActions(
  selectedBlock?: TreeBlock,
  videoActionType?: 'start' | 'complete'
): MetaAction[] {
  if (selectedBlock == null) {
    return metaActions
  }

  const allowedActionTypes: MetaActionType[] = []

  switch (selectedBlock.__typename) {
    case 'CardBlock':
      allowedActionTypes.push(
        'none',
        'christDecisionCapture',
        'gospelStartCapture',
        'gospelCompleteCapture',
        'custom1Capture',
        'custom2Capture',
        'custom3Capture'
      )
      break

    case 'ButtonBlock': {
      const isSubmitButton =
        'submitEnabled' in selectedBlock && selectedBlock.submitEnabled === true

      if (isSubmitButton) {
        allowedActionTypes.push(
          'none',
          'rsvpCapture',
          'prayerRequestCapture',
          'christDecisionCapture',
          'custom1Capture',
          'custom2Capture',
          'custom3Capture'
        )
      } else {
        allowedActionTypes.push(
          'none',
          'christDecisionCapture',
          'prayerRequestCapture',
          'gospelStartCapture',
          'gospelCompleteCapture',
          'custom1Capture',
          'custom2Capture',
          'custom3Capture'
        )
      }
      break
    }

    case 'RadioOptionBlock':
      allowedActionTypes.push(
        'none',
        'christDecisionCapture',
        'prayerRequestCapture',
        'gospelStartCapture',
        'gospelCompleteCapture',
        'custom1Capture',
        'custom2Capture',
        'custom3Capture'
      )
      break

    case 'VideoBlock': {
      if (videoActionType == null) {
        return metaActions
      }
      if (videoActionType === 'start') {
        allowedActionTypes.push(
          'none',
          'specialVideoStartCapture',
          'gospelStartCapture',
          'christDecisionCapture',
          'prayerRequestCapture',
          'custom1Capture',
          'custom2Capture',
          'custom3Capture'
        )
      } else if (videoActionType === 'complete') {
        allowedActionTypes.push(
          'none',
          'specialVideoCompleteCapture',
          'gospelCompleteCapture',
          'christDecisionCapture',
          'prayerRequestCapture',
          'custom1Capture',
          'custom2Capture',
          'custom3Capture'
        )
      }
      break
    }

    default:
      return metaActions
  }

  return metaActions.filter((action) =>
    allowedActionTypes.includes(action.type)
  )
}
