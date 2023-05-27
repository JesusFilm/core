import { aql } from 'arangojs'
import { PrismaClient } from '.prisma/api-journeys-client'
import { ArangoDB } from '../db'

const prisma = new PrismaClient()
const db = ArangoDB()

// TODO: REMOVE once converted to postgresql
export async function psMigrate(): Promise<void> {
  let offset = 0
  let end = true

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
      } catch {}
      console.log(`Importing events for visitor ${visitor._key as string}...`)
      const events = await (
        await db.query(aql`
          FOR event IN events
          FILTER event.userId == ${visitor.userId}
          RETURN event
      `)
      ).all()
      if (events.length === 0) continue
      try {
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
            visitorId: visitor._key,
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
}
