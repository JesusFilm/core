import { spawnSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'

import { PrismaClient } from '@core/prisma/journeys/client'
import { PrismaPg } from '@prisma/adapter-pg'

async function seedPrivatePreview(): Promise<void> {
  const source = process.env.PRIVATE_PREVIEW_TEST_POSTGRES_URL
  if (!source)
    throw new Error(
      'PRIVATE_PREVIEW_TEST_POSTGRES_URL must name a local PostgreSQL administrator connection'
    )
  const url = new URL(source)
  if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
    throw new Error('Local synthetic databases only')
  const manager = process.env.PRIVATE_PREVIEW_MANAGER_UID
  const editor = process.env.PRIVATE_PREVIEW_EDITOR_UID
  const stranger = process.env.PRIVATE_PREVIEW_STRANGER_UID
  if (
    !manager ||
    !editor ||
    !stranger ||
    new Set([manager, editor, stranger]).size !== 3
  )
    throw new Error(
      'Three distinct synthetic Firebase account UIDs are required'
    )
  const database = `journeys_issue_10563_browser_${randomUUID().replaceAll('-', '')}`
  const admin = new PrismaClient({
    adapter: new PrismaPg({ connectionString: source })
  })
  await admin.$executeRawUnsafe(`CREATE DATABASE "${database}"`)
  await admin.$disconnect()
  url.pathname = `/${database}`
  const migration = spawnSync(
    'pnpm',
    [
      'exec',
      'prisma',
      'migrate',
      'deploy',
      '--config',
      'libs/prisma/journeys/prisma.config.ts'
    ],
    {
      stdio: 'inherit',
      env: { ...process.env, PG_DATABASE_URL_JOURNEYS: url.href }
    }
  )
  if (migration.status !== 0)
    throw new Error('Isolated browser database migration failed')
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: url.href })
  })
  try {
    const team = await db.team.create({
      data: {
        title: 'Private preview qualification',
        userTeams: { create: { userId: manager, role: 'manager' } }
      }
    })
    const host = await db.host.create({
      data: {
        teamId: team.id,
        title: 'Preview host',
        location: 'Synthetic location'
      }
    })
    for (const userId of [manager, editor, stranger])
      await db.journeyProfile.create({
        data: { userId, acceptedTermsAt: new Date() }
      })
    const ids: string[] = []
    for (const website of [false, true]) {
      const id = randomUUID()
      ids.push(id)
      const steps = ['start', 'default', 'answer'].map(
        (name) => `${id}-${name}`
      )
      await db.journey.create({
        data: {
          id,
          slug: `preview-10563-${id}`,
          title: 'Private preview sentinel 10563',
          teamId: team.id,
          hostId: host.id,
          languageId: '529',
          website,
          status: 'draft',
          userJourneys: { create: { userId: editor, role: 'editor' } }
        }
      })
      await db.block.createMany({
        data: steps.map((stepId, index) => ({
          id: stepId,
          journeyId: id,
          typename: 'StepBlock',
          parentOrder: index
        }))
      })
      await db.block.update({
        where: { id: steps[0] },
        data: { nextBlockId: steps[1] }
      })
      for (const [index, stepId] of steps.entries()) {
        const card = await db.block.create({
          data: {
            journeyId: id,
            typename: 'CardBlock',
            parentBlockId: stepId,
            parentOrder: 0
          }
        })
        await db.block.create({
          data: {
            journeyId: id,
            typename: 'TypographyBlock',
            parentBlockId: card.id,
            parentOrder: 0,
            content: [
              'Preview start saved',
              'Preview default saved',
              'Preview answer saved'
            ][index],
            variant: 'h1'
          }
        })
        if (index !== 0) continue
        for (const [order, label, blockId] of [
          [1, 'Answer branch', steps[2]],
          [2, 'Default branch', steps[1]]
        ] as const)
          await db.block.create({
            data: {
              journeyId: id,
              typename: 'ButtonBlock',
              parentBlockId: card.id,
              parentOrder: order,
              label,
              action: { create: { blockId } }
            }
          })
        await db.block.create({
          data: {
            journeyId: id,
            typename: 'TextResponseBlock',
            parentBlockId: card.id,
            parentOrder: 3,
            label: 'Contact email',
            type: 'email',
            required: false
          }
        })
        await db.block.create({
          data: {
            journeyId: id,
            typename: 'ButtonBlock',
            parentBlockId: card.id,
            parentOrder: 4,
            label: 'Submit preview form',
            submitEnabled: true
          }
        })
        await db.block.create({
          data: {
            journeyId: id,
            typename: 'ButtonBlock',
            parentBlockId: card.id,
            parentOrder: 5,
            label: 'External example',
            action: { create: { url: 'https://example.com' } }
          }
        })
      }
    }
    console.log(
      JSON.stringify({
        database,
        PRIVATE_PREVIEW_JOURNEY_ID: ids[0],
        PRIVATE_PREVIEW_WEBSITE_ID: ids[1]
      })
    )
  } finally {
    await db.$disconnect()
  }
}

void seedPrivatePreview().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
