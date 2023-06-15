import { aql } from 'arangojs'
import { PrismaClient, JourneyStatus, Block } from '.prisma/api-journeys-client'
import { omit } from 'lodash'
import { ArangoDB } from '../db'

const prisma = new PrismaClient()
const db = ArangoDB()

// TODO: REMOVE once converted to postgresql
export async function psMigrate(): Promise<void> {
  let offset = 0
  let end = true

  // import journeys from arangodb
  offset = 0
  end = true
  do {
    console.log(`Importing journeys at ${offset}...`)
    const journeys = await (
      await db.query(aql`
      FOR journey IN journeys
      LIMIT ${offset}, 50
      RETURN journey
  `)
    ).all()
    for (const journey of journeys) {
      console.log(`Importing journey ${journey._key as string}...`)
      try {
        await prisma.journey.create({
          data: {
            id: journey._key,
            title: journey.title,
            languageId: journey.languageId.toString(),
            description: journey.description ?? undefined,
            slug: journey.slug,
            archivedAt:
              journey.archivedAt != null
                ? new Date(journey.archivedAt)
                : undefined,
            createdAt: new Date(journey.createdAt),
            deletedAt:
              journey.deletedAt != null
                ? new Date(journey.deletedAt)
                : undefined,
            publishedAt:
              journey.publishedAt != null
                ? new Date(journey.publishedAt)
                : undefined,
            trashedAt:
              journey.trashedAt != null
                ? new Date(journey.trashedAt)
                : undefined,
            featuredAt:
              journey.trashedAt != null
                ? new Date(journey.trashedAt)
                : undefined,
            status: journey.status ?? JourneyStatus.draft,
            seoTitle: journey.seoTitle ?? undefined,
            seoDescription: journey.seoDescription ?? undefined,
            primaryImageBlockId: journey.primaryImageBlockId ?? undefined,
            template: journey.template ?? false,
            teamId: journey.teamId ?? 'jfp-team',
            themeMode: journey.themeMode ?? undefined,
            themeName: journey.themeName ?? undefined
          }
        })
        console.log(`Importing blocks for journey ${journey._key as string}...`)
        const blocks = await (
          await db.query(aql`
            FOR block IN blocks
            FILTER block.journeyId == ${journey._key}
            RETURN block
        `)
        ).all()
        await prisma.block.createMany({
          data: blocks.map(
            (block) =>
              ({
                ...omit(block, ['_id', '_key', '_rev', 'action']),
                id: block._key,
                action:
                  block.action != null ? { create: block.action } : undefined
              } as unknown as Block)
          )
        })

        console.log(`Importing userJourneys at ${journey._key as string}...`)
        const userJourneys = await (
          await db.query(aql`
            FOR uj IN userJourneys
            FILTER uj.journeyId == ${journey._key}
            RETURN uj
        `)
        ).all()
        await prisma.userJourney.createMany({
          data: userJourneys.map((uj) => ({
            id: uj._key,
            userId: uj.userId,
            openedAt: new Date(uj.openedAt),
            role: uj.role,
            journeyId: uj.journeyId
          })),
          skipDuplicates: true
        })
      } catch {}
    }
    offset += 50
    end = journeys.length > 49
  } while (end)

  // import userRoles from arangodb
  offset = 0
  end = true
  do {
    console.log(`Importing userRoles at ${offset}...`)
    const userRoles = await (
      await db.query(aql`
          FOR ur IN userRoles
          LIMIT ${offset}, 50
          RETURN ur
      `)
    ).all()
    await prisma.userRole.createMany({
      data: userRoles.map((ur) => ({
        id: ur._key,
        userId: ur.userId,
        roles: ur.roles
      })),
      skipDuplicates: true
    })
    offset += 50
    end = userRoles.length > 49
  } while (end)

  // import journeyProfiles from arangodb
  offset = 0
  end = true
  do {
    console.log(`Importing journeyProfiles at ${offset}...`)
    const journeyProfiles = await (
      await db.query(aql`
          FOR jp IN journeyProfiles
          LIMIT ${offset}, 50
          RETURN jp
      `)
    ).all()
    await prisma.journeyProfile.createMany({
      data: journeyProfiles.map((jp) => ({
        id: jp._key,
        userId: jp.userId,
        acceptedTermsAt: new Date(jp.acceptedTermsAt)
      })),
      skipDuplicates: true
    })
    offset += 50
    end = journeyProfiles.length > 49
  } while (end)

  // import userInvites from arangodb
  offset = 0
  end = true
  do {
    console.log(`Importing userInvites at ${offset}...`)
    const userInvites = await (
      await db.query(aql`
          FOR ui IN userInvites
          LIMIT ${offset}, 50
          RETURN ui
      `)
    ).all()
    await prisma.userInvite.createMany({
      data: userInvites.map((ui) => ({
        id: ui._key,
        journeyId: ui.journeyId,
        senderId: ui.senderId,
        email: ui.email,
        acceptedAt: ui.acceptedAt != null ? new Date(ui.acceptedAt) : undefined,
        removedAt: ui.removedAt != null ? new Date(ui.removedAt) : undefined
      })),
      skipDuplicates: true
    })
    offset += 50
    end = userInvites.length > 49
  } while (end)
}
