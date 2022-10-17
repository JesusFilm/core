import { aql } from 'arangojs'
import { ArangoDB } from './db'

const db = ArangoDB()

export async function populateNewFields(): Promise<void> {
  await db.query(aql`
    FOR e in events
      FOR b in blocks
        FILTER e.blockId == b._key
        UPDATE e._key WITH {journeyId: b.journeyId} IN events
  `)

  await db.query(aql`
    FOR e in events
      FILTER e.createdAt == null
      UPDATE e._key with { createdAt: ${new Date(0).toISOString()}} IN events
  `)

  await db.query(aql`
    FOR e in events
      FILTER e.journeyId == null
      REMOVE e in events
  `)
}
