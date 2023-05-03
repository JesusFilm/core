import { aql } from 'arangojs'
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
    console.log(`Importing teams at ${offset}...`)
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
    console.log(`Importing members at ${offset}...`)
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
        createdAt:
          member.createdAt != null ? new Date(member.createdAt) : new Date()
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
        FILTER visitor.userId != null
        LIMIT ${offset}, 50
        RETURN visitor
      `)
    ).all()
    // get events for visitors
    for (const visitor of visitors) {
      console.log(`Importing visitor ${visitor._key as string}...`)
      try {
        await prisma.visitor.create({
          data: {
            id: visitor._key,
            createdAt: new Date(visitor.createdAt),
            countryCode: visitor.countryCode,
            email: visitor.email ?? undefined,
            lastChatStartedAt:
              visitor.lastChatStartedAt != null
                ? new Date(visitor.lastChatStartedAt)
                : undefined,
            lastChatPlatform: visitor.lastChatPlatform ?? undefined,
            lastStepViewedAt:
              visitor.lastStepViewedAt != null
                ? new Date(visitor.lastStepViewedAt)
                : undefined,
            lastLinkAction: visitor.lastLinkAction ?? undefined,
            lastTextResponse: visitor.lastTextResponse ?? undefined,
            lastRadioQuestion: visitor.lastRadioQuestion ?? undefined,
            messagePlatform: visitor.messagePlatform ?? undefined,
            messagePlatformId: visitor.messagePlatformId ?? undefined,
            name: visitor.name ?? undefined,
            notes: visitor.notes ?? undefined,
            status: visitor.status ?? undefined,
            teamId: visitor.teamId,
            userId: visitor.userId != null ? visitor.userId : null,
            userAgent: visitor.userAgent ?? undefined
          }
        })

        console.log(`Importing events for visitor ${visitor._key as string}...`)
        const events = await (
          await db.query(aql`
          FOR event IN events
          FILTER event.visitorId == ${visitor._key}
          RETURN event
      `)
        ).all()
        if (events.length === 0) continue
        await prisma.event.createMany({
          data: events.map((event) => ({
            id: event._key,
            typename: event.__typename,
            createdAt:
              event.createdAt != null ? new Date(event.createdAt) : new Date(),
            journeyId: event.journeyId ?? undefined,
            blockId: event.blockId ?? undefined,
            stepId: event.stepId ?? undefined,
            label: event.label ?? undefined,
            value: event.value ?? undefined,
            visitorId: event.visitorId,
            actionValue: event.actionValue ?? undefined,
            messagePlatform: event.messagePlatform ?? undefined,
            languageId: event.languageId ?? undefined,
            radioOptionBlockId: event.radioOptionBlockId ?? undefined,
            email: event.email ?? undefined,
            nextStepId: event.nextStepId ?? undefined,
            position: event.position ?? undefined,
            source: event.source ?? undefined,
            progress: event.progress ?? undefined,
            userId: event.userId ?? undefined
          })),
          skipDuplicates: true
        })
      } catch {}
    }
    offset += 50
    end = visitors.length > 49
  } while (end)

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
        console.log(`Importing userJourneys at ${journey._key as string}...`)
        const userJourneys = await (
          await db.query(aql`
            FOR uj IN userJourneys
            FILTER uj.journeyId == ${journey._key}
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
