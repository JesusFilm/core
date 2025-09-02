import { Event, PrismaClient, Visitor } from '@core/prisma/journeys/client'

import { JourneyWithTeamAndUserJourney } from './prisma.types'

interface EmailDetailsResult {
  journey: JourneyWithTeamAndUserJourney | null
  visitor:
    | (Pick<Visitor, 'id' | 'createdAt' | 'duration'> & { events: Event[] })
    | null
}

export async function fetchEmailDetails(
  prismaService: PrismaClient,
  journeyId: string,
  visitorId: string
): Promise<EmailDetailsResult> {
  const [journey, visitor] = await Promise.all([
    prismaService.journey.findUnique({
      where: { id: journeyId },
      include: {
        userJourneys: {
          include: {
            journeyNotification: true
          }
        },
        team: {
          include: {
            userTeams: {
              include: {
                journeyNotifications: true
              }
            }
          }
        }
      }
    }),
    prismaService.visitor.findUnique({
      where: { id: visitorId },
      select: {
        id: true,
        createdAt: true,
        duration: true,
        events: true
      }
    })
  ])

  return { journey, visitor }
}
