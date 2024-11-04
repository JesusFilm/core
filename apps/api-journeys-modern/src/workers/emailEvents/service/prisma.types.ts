import { Prisma } from '.prisma/api-journeys-modern-client'

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
