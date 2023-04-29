import { aql } from 'arangojs'
import { omit } from 'lodash'
import { PrismaClient, JourneyStatus } from '.prisma/api-journeys-client'
import { ArangoDB } from '../db'

const prisma = new PrismaClient()
const db = ArangoDB()

// TODO: REMOVE once converted to postgresql
export async function psMigrate(): Promise<void> {
  // import teams from arangodb
  let offset = 0
  let end = true
  do {
    const teams = await (
      await db.query(aql`
      FOR team IN teams
      LIMIT ${offset}, 50
      RETURN team
  `)
    ).all()
    await prisma.team.createMany({
      data: teams.map((team) => ({
        id: team._key,
        title: team.title,
        contactEmail: team.contactEmail,
        createdAt: new Date(team.createdAt)
      })),
      skipDuplicates: true
    })
    offset += 50
    end = teams.length > 49
  } while (end)

  // import members from arangodb
  offset = 0
  end = true
  do {
    const members = await (
      await db.query(aql`
      FOR member IN members
      LIMIT ${offset}, 50
      RETURN member
  `)
    ).all()
    await prisma.member.createMany({
      data: members.map((member) => ({
        id: member._key,
        teamId: member.teamId,
        userId: member.userId,
        createdAt: new Date(member.createdAt)
      })),
      skipDuplicates: true
    })
    offset += 50
    end = members.length > 49
  } while (end)

  // import visitors from arangodb
  offset = 0
  end = true
  do {
    const visitors = await (
      await db.query(aql`
      FOR visitor IN visitors
      LIMIT ${offset}, 50
      RETURN visitor
  `)
    ).all()
    await prisma.visitor.createMany({
      data: visitors.map((visitor) => ({
        id: visitor._key,
        teamId: visitor.teamId,
        userId: visitor.userId,
        createdAt: new Date(visitor.createdAt)
      })),
      skipDuplicates: true
    })
    offset += 50
    end = visitors.length > 49
  } while (end)

  // import events from arangodb
  offset = 0
  end = true
  do {
    const events = await (
      await db.query(aql`
        FOR event IN events
        LIMIT ${offset}, 50
        RETURN event
      `)
    ).all()
    await prisma.event.createMany({
      data: events.map((event) => ({
        ...omit(event, ['_key', '_id', '_rev', '__typename', 'createdAt']),
        id: event._key,
        typename: event.__typename,
        createdAt: new Date(event.createdAt)
      })),
      skipDuplicates: true
    })
    offset += 50
    end = events.length > 49
  } while (end)

  // import journeys from arangodb
  offset = 0
  end = true
  do {
    const journeys = await (
      await db.query(aql`
      FOR journey IN journeys
      LIMIT ${offset}, 50
      RETURN journey
  `)
    ).all()
    await prisma.journey.createMany({
      data: journeys.map((journey) => ({
        id: journey._key,
        title: journey.title,
        languageId: journey.languageId.toString(),
        description: journey.description ?? undefined,
        slug: journey.slug,
        archivedAt:
          journey.archivedAt != null ? new Date(journey.archivedAt) : undefined,
        createdAt: new Date(journey.createdAt),
        deletedAt:
          journey.deletedAt != null ? new Date(journey.deletedAt) : undefined,
        publishedAt:
          journey.publishedAt != null
            ? new Date(journey.publishedAt)
            : undefined,
        trashedAt:
          journey.trashedAt != null ? new Date(journey.trashedAt) : undefined,
        featuredAt:
          journey.trashedAt != null ? new Date(journey.trashedAt) : undefined,
        status: journey.status ?? JourneyStatus.draft,
        seoTitle: journey.seoTitle ?? undefined,
        seoDescription: journey.seoDescription ?? undefined,
        primaryImageBlockId: journey.primaryImageBlockId ?? undefined,
        template: journey.template ?? false,
        teamId: journey.teamId ?? 'jfp-team',
        themeMode: journey.themeMode ?? undefined,
        themeName: journey.themeName ?? undefined
      })),
      skipDuplicates: true
    })
    offset += 50
    end = journeys.length > 49
  } while (end)

  // import userJourneys from arangodb
  offset = 0
  end = true
  do {
    const userJourneys = await (
      await db.query(aql`
        FOR uj IN userJourneys
        LIMIT ${offset}, 50
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
    offset += 50
    end = userJourneys.length > 49
  } while (end)

  // import userRoles from arangodb
  offset = 0
  end = true
  do {
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
