import { GetAdminJourneys_journeys as Journey } from '../../../../../__generated__/GetAdminJourneys'
import { UserJourneyRole } from '../../../../../__generated__/globalTypes'

export enum JourneyTooltip {
  newEditingRequest,
  newJourney
}

export function getJourneyTooltip(
  journeys: Journey[],
  userId: string
): JourneyTooltip | undefined {
  let actionRequiredMessage: JourneyTooltip | undefined
  let newJourneyMessage: JourneyTooltip | undefined

  journeys?.forEach((journey) => {
    const currentUserJourney = journey.userJourneys?.find(
      (userJourney) => userJourney?.user?.id === userId
    )

    if (currentUserJourney?.role === UserJourneyRole.owner) {
      journey.userJourneys?.forEach((userJourney) => {
        if (userJourney.role === UserJourneyRole.inviteRequested) {
          actionRequiredMessage = JourneyTooltip.newEditingRequest
        }
      })
    }

    if (
      actionRequiredMessage == null &&
      currentUserJourney != null &&
      currentUserJourney.openedAt == null
    ) {
      newJourneyMessage = JourneyTooltip.newJourney
    }
  })

  return actionRequiredMessage ?? newJourneyMessage
}
