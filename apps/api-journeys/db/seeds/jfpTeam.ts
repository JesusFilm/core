import { aql } from 'arangojs'
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
}
