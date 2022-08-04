import { aql } from 'arangojs'
import { ArangoDB } from '../db'

const db = ArangoDB()

export async function createUserRolesCollection(): Promise<void> {
  await db.collection('userRoles').drop()
  await db.createCollection('userRoles', {
    keyOptions: { type: 'uuid' }
  })

  const users = await db.query(aql`
    FOR user IN users
          return user
  `)

  async function generateEmptyUserRoles(): Promise<void> {
    while (users.hasNext) {
      const u = await users.next()
      await db.collection('userRoles').save({
        userId: u.userId,
        roles: []
      })
    }
  }

  await generateEmptyUserRoles()
}
