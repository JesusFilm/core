import { JourneyStatus, Prisma, prisma } from '@core/prisma/journeys/client'

import {
  lockJourney,
  removeMembershipsFromPages
} from '../templateGalleryPage/membership'

import { Action, journeyAcl, journeyReadAccessWhere } from './journey.acl'

interface ArchiveOrTrashJourneysParams<
  TSelection extends Prisma.JourneyDefaultArgs
> {
  ids: readonly string[]
  user: Parameters<typeof journeyAcl>[2]
  status: typeof JourneyStatus.archived | typeof JourneyStatus.trashed
  query: TSelection
}

/**
 * Archive or trash only journeys the caller can manage. Each status change and
 * its collection cleanup commit together, with the journey locked before the
 * membership read. Keep the original updatedAt so lifecycle changes preserve
 * the journey's content-edit timestamp and reject concurrent content edits.
 */
export async function archiveOrTrashJourneys<
  TSelection extends Prisma.JourneyDefaultArgs
>({ ids, user, status, query }: ArchiveOrTrashJourneysParams<TSelection>) {
  const journeys = await prisma.journey.findMany({
    where: {
      AND: [journeyReadAccessWhere(user.id, user), { id: { in: [...ids] } }]
    },
    include: {
      userJourneys: true,
      team: { include: { userTeams: true } }
    }
  })
  const manageableJourneys = journeys.filter((journey) =>
    journeyAcl(Action.Manage, journey, user)
  )

  return await Promise.all(
    manageableJourneys.map(async (journey) =>
      prisma.$transaction(async (tx) => {
        await lockJourney(tx, journey.id)
        const updated = await tx.journey.update({
          ...query,
          where: { id: journey.id, updatedAt: journey.updatedAt },
          data: {
            ...(status === JourneyStatus.archived
              ? { status, archivedAt: new Date() }
              : { status, trashedAt: new Date() }),
            updatedAt: journey.updatedAt
          }
        })
        const memberships = await tx.templateGalleryPageTemplate.findMany({
          where: { journeyId: journey.id },
          select: { templateGalleryPageId: true }
        })
        await removeMembershipsFromPages(
          tx,
          journey.id,
          memberships.map((row) => row.templateGalleryPageId)
        )
        return updated
      })
    )
  )
}
