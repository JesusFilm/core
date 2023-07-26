import { GetAdminJourneys_journeys as Journey } from '../../../../../__generated__/GetAdminJourneys'
import { UserJourneyRole } from '../../../../../__generated__/globalTypes'

export function getJourneyTooltip(
  t: (str: string) => string,
  journeys?: Journey[],
  userId?: string | null
): string | undefined {
  let actionRequiredMessage: string | undefined
  let newJourneyMessage: string | undefined

  journeys?.forEach((journey) => {
    const currentUserJourney = journey.userJourneys?.find(
      (userJourney) => userJourney?.user?.id === userId
    )

    if (currentUserJourney?.role === UserJourneyRole.owner) {
      journey.userJourneys?.forEach((userJourney) => {
        if (userJourney.role === UserJourneyRole.inviteRequested) {
          actionRequiredMessage = t('New editing request')
        }
      })
    }

    if (
      actionRequiredMessage == null &&
      currentUserJourney != null &&
      currentUserJourney.openedAt == null
    ) {
      newJourneyMessage = t('New journey')
    }
  })

  return actionRequiredMessage ?? newJourneyMessage
}
