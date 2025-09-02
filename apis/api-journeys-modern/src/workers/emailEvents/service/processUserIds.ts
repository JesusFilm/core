import { UserJourneyRole } from '@core/prisma/journeys/client'

import { JourneyWithTeamAndUserJourney } from './prisma.types'

export function processUserIds(
  journey: JourneyWithTeamAndUserJourney
): string[] {
  const recipientUserIds = new Set<string>()

  journey.userJourneys
    .filter(
      (userJourney) =>
        userJourney.role === UserJourneyRole.owner ||
        userJourney.role === UserJourneyRole.editor
    )
    .forEach((userJourney) => {
      const journeyNotification = userJourney.journeyNotification
      const userId = journeyNotification?.userId as string
      if (journeyNotification?.visitorInteractionEmail === true)
        recipientUserIds.add(userId)
    })

  if (journey.team != null) {
    journey.team.userTeams.forEach((userTeam) => {
      const journeyNotification = userTeam.journeyNotifications.find(
        (notification) => notification.userId === userTeam.userId
      )
      const userId = journeyNotification?.userId as string
      if (journeyNotification?.visitorInteractionEmail === true)
        recipientUserIds.add(userId)
    })
  }

  return Array.from(recipientUserIds)
}
