import { aql } from 'arangojs'
import { ArangoDB } from '../db'

const db = ArangoDB()

// this should be removed when the UI can support team management
export async function jfpTeam(): Promise<void> {
  // create JFP team (teams)
  const team = await db.collection('teams').save(
    {
      _key: 'jfp-team',
      title: 'Jesus Film Project',
      contactEmail: 'sway.ciaramello@jesusfilm.org',
      createdAt: new Date().toISOString()
    },
    { overwriteMode: 'ignore' }
  )

  // update all journeys to belong to JFP team (journeys)
  await db.query(aql`
    FOR journey IN journeys
      UPDATE journey._key WITH { teamId: ${team._key} }
      IN journeys
  `)

  // add all users to JFP team (members)
  await db.query(aql`
    FOR userJourney IN userJourneys
      INSERT {
        _key: CONCAT(userJourney.userId, ":", ${team._key}),
        teamId: ${team._key}, 
        userId: userJourney.userId, 
        createdAt: DATE_ISO8601(DATE_NOW())
      }
      INTO members OPTIONS { ignoreErrors: true }
  `)

  // add all visitors to JFP team (visitors)
  await db.query(aql`
    FOR event IN events
      INSERT {
        _key: CONCAT(event.userId, ":", ${team._key}),
        teamId: ${team._key}, 
        userId: event.userId,
        createdAt: DATE_ISO8601(DATE_NOW())
      }
      IN visitors OPTIONS { ignoreErrors: true }
  `)
}
