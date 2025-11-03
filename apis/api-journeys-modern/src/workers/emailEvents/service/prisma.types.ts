import { Prisma } from '@core/prisma/journeys/client'

export type JourneyWithTeamAndUserJourney = Prisma.JourneyGetPayload<{
  include: {
    team: {
      include: {
        userTeams: {
          include: {
            journeyNotifications: true
          }
        }
      }
    }
    userJourneys: {
      include: {
        journeyNotification: true
      }
    }
  }
}>
