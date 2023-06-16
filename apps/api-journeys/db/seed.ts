// version 6
// increment to trigger re-seed (ie: files other than seed.ts are changed)

import { ArangoDB } from './db'
import { nua1 } from './seeds/nua1'
import { nua2 } from './seeds/nua2'
import { nua8 } from './seeds/nua8'
import { nua9 } from './seeds/nua9'
import { jfpTeam } from './seeds/jfpTeam'
import { onboarding } from './seeds/onboarding'
import { onboardingTemplates } from './seeds/onboardingTemplates'
import { psMigrate } from './seeds/psMigrate'

const db = ArangoDB()

async function main(): Promise<void> {
  if (!(await db.collection('journeys').exists()))
    await db.createCollection('journeys', {
      keyOptions: { type: 'uuid' }
    })

  await db.collection('journeys').ensureIndex({
    type: 'persistent',
    fields: ['slug'],
    name: 'slug',
    unique: true
  })

  if (!(await db.collection('blocks').exists()))
    await db.createCollection('blocks', { keyOptions: { type: 'uuid' } })

  await db.collection('blocks').ensureIndex({
    type: 'persistent',
    fields: ['journeyId'],
    name: 'journeyId'
  })

  if (!(await db.collection('hosts').exists()))
    await db.createCollection('hosts', {
      keyOptions: { type: 'uuid' }
    })

  await db.collection('hosts').ensureIndex({
    type: 'persistent',
    fields: ['teamId'],
    name: 'hostsTeam'
  })

  if (!(await db.collection('userJourneys').exists()))
    await db.createCollection('userJourneys', {
      keyOptions: { type: 'uuid' }
    })

  await db.collection('userJourneys').ensureIndex({
    type: 'persistent',
    fields: ['journeyId', 'userId'],
    name: 'journeyIdAndUserId',
    unique: true
  })

  if (!(await db.collection('userInvites').exists()))
    await db.createCollection('userInvites', {
      keyOptions: { type: 'uuid' }
    })

  await db.collection('userInvites').ensureIndex({
    type: 'persistent',
    fields: ['journeyId', 'email'],
    name: 'journeyIdAndEmail',
    unique: true
  })

  if (!(await db.collection('teams').exists()))
    await db.createCollection('teams', {
      keyOptions: { type: 'uuid' }
    })

  await db.collection('teams').ensureIndex({
    type: 'persistent',
    fields: ['title'],
    name: 'teamsTitle',
    unique: true
  })

  if (!(await db.collection('members').exists()))
    await db.createCollection('members', {
      keyOptions: { type: 'uuid' }
    })

  await db.collection('members').ensureIndex({
    type: 'persistent',
    fields: ['teamId', 'userId'],
    name: 'teamIdAndUserId',
    unique: true
  })

  if (!(await db.collection('journeyProfiles').exists()))
    await db.createCollection('journeyProfiles', {
      keyOptions: { type: 'uuid' }
    })

  await db.collection('journeyProfiles').ensureIndex({
    type: 'persistent',
    fields: ['userId'],
    name: 'userId',
    unique: true
  })

  if (!(await db.collection('userRoles').exists()))
    await db.createCollection('userRoles', {
      keyOptions: { type: 'uuid' }
    })

  await nua1()
  await nua2()
  await nua8()
  await nua9()
  await onboarding()
  await onboardingTemplates()

  // commented out until future migration
  await psMigrate()

  // this should be removed when the UI can support team management
  await jfpTeam()
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
