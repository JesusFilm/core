import { aql } from 'arangojs'
import { omit } from 'lodash'
import { PrismaClient } from '.prisma/api-journeys-client'
import { ArangoDB } from '../db'

const prisma = new PrismaClient()
const db = ArangoDB()

// this should be removed when the UI can support team management
export async function jfpTeam(): Promise<void> {
  await prisma.$connect()
  const data = {
    title: 'Jesus Film Project',
    contactEmail: 'sway.ciaramello@jesusfilm.org'
  }
  // create JFP team (teams)
  const team = await prisma.team.upsert({
    where: {
      id: 'jfp-team'
    },
    create: {
      ...data,
      id: 'jfp-team',
      createdAt: new Date()
    },
    update: {
      ...data
    }
  })

  // update all journeys to belong to JFP team (journeys)
  await db.query(aql`
    FOR journey IN journeys
      UPDATE journey._key WITH { teamId: ${team.id} }
      IN journeys
  `)

  // add all users to JFP team (members)
  await db.query(aql`
    FOR userJourney IN userJourneys
      INSERT {
        _key: CONCAT(userJourney.userId, ":", ${team.id}),
        teamId: ${team.id}, 
        userId: userJourney.userId, 
        createdAt: DATE_ISO8601(DATE_NOW())
      }
      INTO members OPTIONS { ignoreErrors: true }
  `)

  // TODO: REMOVE once converted to postgresql
  // import visitors from arangodb
  let offset = 0
  let end = true
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

  // TODO: REMOVE once converted to postgresql
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
        id: event._key,
        typename: event.__typename,
        journeyId: event.journeyId,
        createdAt: new Date(event.createdAt),
        label: event.label,
        value: event.value,
        visitorId: event.visitorId,
        extra: omit(event, [
          '_id',
          '_key',
          '_rev',
          '__typename',
          'journeyId',
          'createdAt',
          'label',
          'value',
          'visitorId'
        ])
      })),
      skipDuplicates: true
    })
    offset += 50
    end = events.length > 49
  } while (end)
}
