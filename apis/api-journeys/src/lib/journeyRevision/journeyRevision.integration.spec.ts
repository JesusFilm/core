import { createRequire } from 'node:module'

import { initContextCache } from '@pothos/core'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { revisionDatabase } from '../../../test/revisionDatabase'
import { schema } from '../../schema'

import {
  lockDraftJourneyRevision,
  readJourneyRevision
} from './journeyRevision'

vi.mock('@core/prisma/journeys/client', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('@core/prisma/journeys/client')>()
  const { revisionDatabase } = await import(
    /* webpackChunkName: "revisionDatabase" */ '../../../test/revisionDatabase'
  )
  return { ...original, prisma: revisionDatabase.client }
})

// Pothos builds the schema with GraphQL's CommonJS entry point.
const { execute, parse } = createRequire(import.meta.url)(
  'graphql'
) as typeof import('graphql')

// Only queues are stubbed. Resolvers, ACL reads, Prisma, triggers and locks are real.
const journeyId = 'journey'
const blockCases = [
  ['step', {}, { x: 40 }],
  ['card', {}, { backgroundColor: '#123456' }],
  ['typography', { content: 'New text' }, { content: 'Human text' }],
  ['button', { label: 'Button' }, { label: 'Human label' }],
  ['image', { alt: 'Image' }, { alt: 'Human alt' }],
  ['video', {}, { muted: true }],
  ['icon', {}, { name: 'ArrowForwardRounded' }],
  ['radioQuestion', {}, { gridView: true }],
  ['radioOption', { label: 'Option' }, { label: 'Human option' }],
  ['multiselect', {}, { min: 1 }],
  ['multiselectOption', { label: 'Option' }, { label: 'Human option' }],
  ['signUp', { submitLabel: 'Submit' }, { submitLabel: 'Human submit' }],
  ['spacer', {}, { spacing: 25 }],
  ['textResponse', { label: 'Response' }, { label: 'Human response' }]
] satisfies [string, Record<string, unknown>, Record<string, unknown>][]

async function mutate(
  name: string,
  args: Record<string, unknown>,
  userId = 'author'
) {
  const field = schema.getMutationType()?.getFields()[name]
  if (field == null) throw new Error(`missing mutation ${name}`)
  const usedArgs = field.args.filter((arg) =>
    Object.prototype.hasOwnProperty.call(args, arg.name)
  )
  const variables = usedArgs
    .map((arg) => `$${arg.name}: ${arg.type.toString()}`)
    .join(', ')
  const inputs = usedArgs.map((arg) => `${arg.name}: $${arg.name}`).join(', ')
  return execute({
    schema,
    document: parse(
      `mutation(${variables}) { ${name}(${inputs}) ${name === 'journeySimpleUpdate' ? '' : '{ __typename }'} }`
    ),
    variableValues: args,
    contextValue: {
      ...initContextCache(),
      type: 'authenticated',
      user: {
        id: userId,
        email: `${userId}@example.invalid`,
        roles: ['publisher']
      },
      currentRoles: ['publisher']
    }
  })
}

async function revision(id = journeyId) {
  return BigInt(await readJourneyRevision(prisma, id))
}

async function accepted(name: string, args: Record<string, unknown>) {
  const before = await revision()
  const result = await mutate(name, args)
  expect(result.errors).toBeUndefined()
  expect(await revision()).toBeGreaterThan(before)
}

function barrier() {
  let resolve!: () => void
  const promise = new Promise<void>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

async function waitForDatabaseLock(expected = 1n) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const rows = await prisma.$queryRaw<{ waiting: bigint }[]>`
      SELECT count(*) AS waiting FROM pg_stat_activity
      WHERE datname = current_database() AND wait_event_type = 'Lock'
    `
    if (rows[0].waiting >= expected) return
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
  throw new Error('concurrent writer did not reach the database lock')
}

describe('shared journey revision integration', () => {
  beforeAll(async () => {
    await revisionDatabase.create()
  })

  afterAll(async () => {
    await revisionDatabase.destroy()
  })

  beforeEach(async () => {
    await prisma.journey.deleteMany({ where: { id: { not: 'legacy' } } })
    await prisma.team.upsert({
      where: { id: 'team' },
      update: {},
      create: {
        id: 'team',
        title: 'Synthetic',
        userTeams: { create: { userId: 'author', role: 'manager' } }
      }
    })
    await prisma.journey.create({
      data: {
        id: journeyId,
        slug: 'synthetic',
        title: 'Original',
        languageId: '529',
        teamId: 'team',
        status: 'draft'
      }
    })
    await prisma.$transaction(async (tx) => {
      await tx.block.create({
        data: {
          id: 'target-step',
          journeyId,
          typename: 'StepBlock',
          parentOrder: 1
        }
      })
      await tx.block.create({
        data: { id: 'step', journeyId, typename: 'StepBlock', parentOrder: 0 }
      })
      await tx.block.create({
        data: {
          id: 'card',
          journeyId,
          typename: 'CardBlock',
          parentBlockId: 'step',
          parentOrder: 0
        }
      })
      for (const [kind] of blockCases.filter(
        ([kind]) => !['step', 'card'].includes(kind)
      )) {
        await tx.block.create({
          data: {
            id: kind,
            journeyId,
            typename: `${kind[0].toUpperCase()}${kind.slice(1)}Block`,
            parentBlockId:
              kind === 'radioOption'
                ? 'radioQuestion'
                : kind === 'multiselectOption'
                  ? 'multiselect'
                  : 'card',
            parentOrder: blockCases.findIndex(([name]) => name === kind),
            label: 'Original',
            content: 'Original',
            source: kind === 'video' ? 'internal' : null
          }
        })
      }
    })
  })

  describe('existing Admin GraphQL writers', () => {
    it.each(blockCases)(
      '%s create advances the owning revision',
      async (kind, input, _update) => {
        if (kind === 'video') {
          await prisma.block.delete({ where: { id: 'video' } })
        }
        const parentBlockId =
          kind === 'card'
            ? 'step'
            : kind === 'radioOption'
              ? 'radioQuestion'
              : kind === 'multiselectOption'
                ? 'multiselect'
                : 'card'
        await accepted(`${kind}BlockCreate`, {
          input: {
            journeyId,
            ...(kind === 'step' ? {} : { parentBlockId }),
            ...input
          }
        })
      }
    )

    it.each(blockCases)(
      '%s update advances the owning revision with its persisted value',
      async (kind, _create, input) => {
        await accepted(
          `${kind}BlockUpdate`,
          kind === 'radioQuestion'
            ? { id: kind, parentBlockId: 'card', ...input }
            : { id: kind, input }
        )
        expect(
          await prisma.block.findUniqueOrThrow({ where: { id: kind } })
        ).toMatchObject(input)
      }
    )

    const actionCases = [
      ['blockUpdateLinkAction', { url: 'https://example.invalid' }],
      ['blockUpdateEmailAction', { email: 'synthetic@example.invalid' }],
      ['blockUpdatePhoneAction', { phone: '+15555555555', countryCode: 'US' }],
      ['blockUpdateChatAction', { chatUrl: 'https://example.invalid/chat' }],
      ['blockUpdateNavigateToBlockAction', { blockId: 'step' }],
      ['blockUpdateAction', { url: 'https://example.invalid/generic' }],
      ['blockUpdateAction', { email: 'generic@example.invalid' }],
      ['blockUpdateAction', { phone: '+15555555555', countryCode: 'US' }],
      ['blockUpdateAction', { chatUrl: 'https://example.invalid/chat' }],
      ['blockUpdateAction', { blockId: 'target-step' }]
    ] satisfies [string, Record<string, unknown>][]

    it.each(actionCases)(
      '%s changes the parent journey, not Action.journeyId',
      async (name, input) => {
        await prisma.action.create({
          data: { parentBlockId: 'button', journeyId: 'legacy' }
        })
        const destinationRevision = await revision('legacy')
        await accepted(name, { id: 'button', input })
        expect(await revision('legacy')).toBe(destinationRevision)
        expect(
          await prisma.action.findUniqueOrThrow({
            where: { parentBlockId: 'button' }
          })
        ).toMatchObject(input)
      }
    )

    it('blockDeleteAction participates as the seventh action entry point', async () => {
      await prisma.action.create({
        data: { parentBlockId: 'button', url: 'https://example.invalid' }
      })
      await accepted('blockDeleteAction', { id: 'button' })
      expect(await prisma.action.count()).toBe(0)
    })

    it.each([
      'journeyPublish',
      'journeysArchive',
      'journeysTrash',
      'journeysDelete'
    ])('%s changes state and revision together', async (name) => {
      await accepted(
        name,
        name === 'journeyPublish' ? { id: journeyId } : { ids: [journeyId] }
      )
      expect(
        (await prisma.journey.findUniqueOrThrow({ where: { id: journeyId } }))
          .status
      ).not.toBe('draft')
    })

    it('journeysRestore participates', async () => {
      await prisma.journey.update({
        where: { id: journeyId },
        data: { status: 'trashed', trashedAt: new Date() }
      })
      await accepted('journeysRestore', { ids: [journeyId] })
    })

    it.each(['journeyThemeCreate', 'journeyThemeUpdate', 'journeyThemeDelete'])(
      '%s participates',
      async (name) => {
        const theme =
          name === 'journeyThemeCreate'
            ? null
            : await prisma.journeyTheme.create({
                data: { journeyId, userId: 'author' }
              })
        await accepted(
          name,
          name === 'journeyThemeCreate'
            ? { input: { journeyId, headerFont: 'Montserrat' } }
            : name === 'journeyThemeUpdate'
              ? { id: theme?.id, input: { headerFont: 'Montserrat' } }
              : { id: theme?.id }
        )
      }
    )

    it.each(['chatButtonCreate', 'chatButtonUpdate', 'chatButtonRemove'])(
      '%s participates',
      async (name) => {
        const button =
          name === 'chatButtonCreate'
            ? null
            : await prisma.chatButton.create({
                data: { journeyId, platform: 'facebook', link: 'old' }
              })
        await accepted(
          name,
          name === 'chatButtonCreate'
            ? { journeyId, input: { platform: 'facebook', link: 'new' } }
            : name === 'chatButtonUpdate'
              ? { id: button?.id, journeyId, input: { link: 'new' } }
              : { id: button?.id, journeyId }
        )
      }
    )

    it.each([
      [
        'journeyUpdate',
        {
          id: journeyId,
          input: {
            title: 'Human title',
            primaryImageBlockId: 'image',
            tagIds: ['synthetic-tag']
          }
        }
      ],
      ['journeyFeature', { id: journeyId, feature: true }],
      ['journeyTemplate', { id: journeyId, input: { template: true } }],
      ['stepBlockPositionUpdate', { input: [{ id: 'step', x: 100, y: 200 }] }],
      ['blockOrderUpdate', { id: 'button', parentOrder: 0 }],
      ['blockDelete', { id: 'button' }],
      ['blockDuplicate', { id: 'button' }],
      [
        'journeySimpleUpdate',
        {
          id: journeyId,
          journey: {
            title: 'Compact title',
            description: 'Compact description',
            cards: [{ id: 'new-card', heading: 'Compact heading', x: 0, y: 0 }]
          }
        }
      ]
    ] satisfies [string, Record<string, unknown>][])(
      '%s participates',
      async (name, args) => {
        await accepted(name, args)
      }
    )

    it('blockRestore participates', async () => {
      await prisma.block.update({
        where: { id: 'button' },
        data: { deletedAt: new Date() }
      })
      await accepted('blockRestore', { id: 'button' })
    })

    it('customization value and publisher replacement participate', async () => {
      const field = await prisma.journeyCustomizationField.create({
        data: { journeyId, key: 'name', value: 'Original' }
      })
      await accepted('journeyCustomizationFieldUserUpdate', {
        journeyId,
        input: [{ id: field.id, key: field.key, value: 'Human value' }]
      })
      await prisma.journey.update({
        where: { id: journeyId },
        data: { template: true }
      })
      await accepted('journeyCustomizationFieldPublisherUpdate', {
        journeyId,
        string: 'Welcome {{ name }}'
      })
    })

    it('rejected rights and invalid input advance neither content nor revision', async () => {
      const before = await revision()
      expect(
        (
          await mutate(
            'typographyBlockUpdate',
            { id: 'typography', input: { content: 'Denied' } },
            'stranger'
          )
        ).errors
      ).toBeDefined()
      expect(
        (
          await mutate('multiselectBlockUpdate', {
            id: 'multiselect',
            input: { min: -1 }
          })
        ).errors
      ).toBeDefined()
      expect(await revision()).toBe(before)
      expect(
        (await prisma.block.findUniqueOrThrow({ where: { id: 'typography' } }))
          .content
      ).toBe('Original')
    })

    it('ordinary Admin can still edit published content', async () => {
      await accepted('journeyPublish', { id: journeyId })
      await accepted('typographyBlockUpdate', {
        id: 'typography',
        input: { content: 'Published human edit' }
      })
    })
  })

  describe('owning compare-and-save boundary', () => {
    it('serializes concurrent Admin child creates without a parent lock upgrade deadlock', async () => {
      const before = await revision()
      const held = barrier()
      const release = barrier()
      const parent = prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT "id" FROM "Block" WHERE "id" = 'card' FOR NO KEY UPDATE`
        held.resolve()
        await release.promise
      })
      await held.promise
      const creates = Array.from({ length: 4 }, (_, index) =>
        mutate('typographyBlockCreate', {
          input: {
            journeyId,
            parentBlockId: 'card',
            content: `Concurrent child ${index}`
          }
        })
      )
      try {
        await waitForDatabaseLock(4n)
      } finally {
        release.resolve()
      }
      await parent
      for (const result of await Promise.all(creates))
        expect(result.errors).toBeUndefined()
      expect(await revision()).toBe(before + 4n)
    })

    it('an ordinary Admin content writer waits for the bounded edit lock', async () => {
      const before = await revision()
      const locked = barrier()
      const release = barrier()
      const edit = prisma.$transaction(async (tx) => {
        await lockDraftJourneyRevision(tx, journeyId, String(before))
        locked.resolve()
        await release.promise
      })
      await locked.promise
      const admin = mutate('typographyBlockUpdate', {
        id: 'typography',
        input: { content: 'Concurrent human' }
      })
      try {
        await waitForDatabaseLock()
        expect(await revision()).toBe(before)
      } finally {
        release.resolve()
      }
      await edit
      expect((await admin).errors).toBeUndefined()
      expect(await revision()).toBe(before + 1n)
    })

    it('a bounded edit queued behind an Admin content transaction sees the new revision', async () => {
      const before = await revision()
      const locked = barrier()
      const release = barrier()
      const admin = prisma.$transaction(async (tx) => {
        await tx.block.update({
          where: { id: 'typography' },
          data: { content: 'Concurrent human' }
        })
        locked.resolve()
        await release.promise
      })
      await locked.promise
      const edit = prisma.$transaction((tx) =>
        lockDraftJourneyRevision(tx, journeyId, String(before))
      )
      const rejected = expect(edit).rejects.toMatchObject({
        extensions: { code: 'REVISION_CONFLICT' }
      })
      try {
        await waitForDatabaseLock()
      } finally {
        release.resolve()
      }
      await admin
      await rejected
      expect(await revision()).toBe(before + 1n)
    })

    it('ignores no-op, timestamp, analytics-token and export-order maintenance', async () => {
      const before = await revision()
      await prisma.journey.update({
        where: { id: journeyId },
        data: { updatedAt: new Date(), plausibleToken: 'synthetic' }
      })
      await prisma.block.update({
        where: { id: 'typography' },
        data: { content: 'Original', exportOrder: 5 }
      })
      expect(await revision()).toBe(before)
    })

    it.each(['', '-1', '01', '1.0', ' 1', '1e2', '12345678901234567890'])(
      'rejects malformed revision %j before writing',
      async (expected) => {
        const before = await revision()
        await expect(
          prisma.$transaction((tx) =>
            lockDraftJourneyRevision(tx, journeyId, expected)
          )
        ).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } })
        expect(await revision()).toBe(before)
      }
    )

    it('rejects stale content without partial writes, then permits an explicit fresh replacement', async () => {
      const oldRevision = String(await revision())
      await accepted('typographyBlockUpdate', {
        id: 'typography',
        input: { content: 'Human authored' }
      })
      const current = await revision()
      await expect(
        prisma.$transaction(async (tx) => {
          await lockDraftJourneyRevision(tx, journeyId, oldRevision)
          await tx.block.update({
            where: { id: 'typography' },
            data: { content: 'Stale agent' }
          })
        })
      ).rejects.toMatchObject({ extensions: { code: 'REVISION_CONFLICT' } })
      expect(await revision()).toBe(current)
      expect(
        (await prisma.block.findUniqueOrThrow({ where: { id: 'typography' } }))
          .content
      ).toBe('Human authored')
      await prisma.$transaction(async (tx) => {
        await lockDraftJourneyRevision(tx, journeyId, String(current))
        await tx.block.update({
          where: { id: 'typography' },
          data: { content: 'Explicit replacement' }
        })
        await tx.action.create({
          data: { parentBlockId: 'button', url: 'https://example.invalid' }
        })
      })
      expect(await revision()).toBe(current + 1n)
    })

    it('rolls back revision with the entire owning transaction', async () => {
      const before = await revision()
      await expect(
        prisma.$transaction(async (tx) => {
          await tx.block.update({
            where: { id: 'typography' },
            data: { content: 'Rolled back' }
          })
          expect(await readJourneyRevision(tx, journeyId)).toBe(
            String(before + 1n)
          )
          throw new Error('controlled failure')
        })
      ).rejects.toThrow('controlled failure')
      expect(await revision()).toBe(before)
      expect(
        (await prisma.block.findUniqueOrThrow({ where: { id: 'typography' } }))
          .content
      ).toBe('Original')
    })

    it.each(['published', 'archived', 'trashed', 'deleted'] as const)(
      'rejects an edit queued behind %s',
      async (status) => {
        const before = String(await revision())
        const locked = barrier()
        const release = barrier()
        const lifecycle = prisma.$transaction(async (tx) => {
          await tx.journey.update({
            where: { id: journeyId },
            data: { status }
          })
          locked.resolve()
          await release.promise
        })
        await locked.promise
        const edit = prisma.$transaction(async (tx) => {
          await lockDraftJourneyRevision(tx, journeyId, before)
          await tx.block.update({
            where: { id: 'typography' },
            data: { content: 'Forbidden' }
          })
        })
        const rejected = expect(edit).rejects.toMatchObject({
          extensions: { code: 'NOT_EDITABLE' }
        })
        try {
          await waitForDatabaseLock()
        } finally {
          release.resolve()
        }
        await lifecycle
        await rejected
        expect(
          (
            await prisma.block.findUniqueOrThrow({
              where: { id: 'typography' }
            })
          ).content
        ).toBe('Original')
      }
    )

    it.each(['published', 'archived', 'trashed', 'deleted'] as const)(
      'allows a bounded edit before %s acquires the shared lock',
      async (status) => {
        const before = await revision()
        const locked = barrier()
        const release = barrier()
        const edit = prisma.$transaction(async (tx) => {
          await lockDraftJourneyRevision(tx, journeyId, String(before))
          locked.resolve()
          await release.promise
          await tx.block.update({
            where: { id: 'typography' },
            data: { content: 'Accepted before lifecycle' }
          })
        })
        await locked.promise
        const lifecycle = prisma.journey
          .update({
            where: { id: journeyId },
            data: { status }
          })
          .then((journey) => journey)
        try {
          await waitForDatabaseLock()
        } finally {
          release.resolve()
        }
        await edit
        await lifecycle
        expect(await revision()).toBe(before + 2n)
        expect(
          (await prisma.journey.findUniqueOrThrow({ where: { id: journeyId } }))
            .status
        ).toBe(status)
      }
    )

    it.each([
      { template: true },
      { templateSite: true },
      { deletedAt: new Date() },
      { archivedAt: new Date() },
      { trashedAt: new Date() }
    ])('refuses nonordinary draft state %j', async (data) => {
      await prisma.journey.update({ where: { id: journeyId }, data })
      await expect(
        prisma.$transaction((tx) =>
          lockDraftJourneyRevision(tx, journeyId, String(0))
        )
      ).rejects.toMatchObject({ extensions: { code: 'NOT_EDITABLE' } })
    })

    it('reads content and revision in one repeatable snapshot', async () => {
      await prisma.$transaction(
        async (tx) => {
          const before = await readJourneyRevision(tx, journeyId)
          await prisma.block.update({
            where: { id: 'typography' },
            data: { content: 'Later human' }
          })
          expect(await readJourneyRevision(tx, journeyId)).toBe(before)
          expect(
            (await tx.block.findUniqueOrThrow({ where: { id: 'typography' } }))
              .content
          ).toBe('Original')
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead }
      )
    })
  })

  describe('shared dependencies and rolling deployment', () => {
    it('holds a new integration attachment behind its source transaction', async () => {
      const integration = await prisma.integration.create({
        data: { teamId: 'team', type: 'growthSpaces' }
      })
      const before = await revision()
      const held = barrier()
      const release = barrier()
      const source = prisma.$transaction(async (tx) => {
        await tx.integration.update({
          where: { id: integration.id },
          data: { oauthStale: true }
        })
        held.resolve()
        await release.promise
      })
      await held.promise
      const attach = prisma.block
        .update({
          where: { id: 'textResponse' },
          data: { integrationId: integration.id }
        })
        .then((block) => block)
      try {
        await waitForDatabaseLock()
        expect(await revision()).toBe(before)
      } finally {
        release.resolve()
      }
      await source
      await attach
      expect(await revision()).toBe(before + 1n)
    })

    it('invalidates an integration attachment committed before its waiting source transaction', async () => {
      const integration = await prisma.integration.create({
        data: { teamId: 'team', type: 'growthSpaces' }
      })
      const before = await revision()
      const held = barrier()
      const release = barrier()
      const attach = prisma.$transaction(async (tx) => {
        await tx.block.update({
          where: { id: 'textResponse' },
          data: { integrationId: integration.id }
        })
        held.resolve()
        await release.promise
      })
      await held.promise
      const source = prisma.integration
        .update({ where: { id: integration.id }, data: { oauthStale: true } })
        .then((value) => value)
      try {
        await waitForDatabaseLock()
      } finally {
        release.resolve()
      }
      await attach
      await source
      expect(await revision()).toBe(before + 2n)
    })

    it.each(['content', 'action'])(
      'invalidates a shared menu when descendant %s changes',
      async (kind) => {
        await prisma.journey.create({
          data: {
            id: 'referrer',
            title: 'Referrer',
            slug: 'referrer',
            teamId: 'team',
            languageId: '529',
            status: 'draft',
            menuStepBlockId: 'step'
          }
        })
        const before = await revision('referrer')
        if (kind === 'content') {
          await prisma.block.update({
            where: { id: 'typography' },
            data: { content: 'Changed descendant' }
          })
        } else {
          await prisma.action.create({
            data: { parentBlockId: 'button', url: 'https://example.invalid' }
          })
        }
        expect(await revision('referrer')).toBe(before + 1n)
      }
    )

    it.each(['image', 'menu'])(
      'serializes a new shared %s attachment behind its paused source update',
      async (kind) => {
        await prisma.journey.create({
          data: {
            id: 'referrer',
            title: 'Referrer',
            slug: 'referrer',
            teamId: 'team',
            languageId: '529',
            status: 'draft'
          }
        })
        const before = await revision('referrer')
        const held = barrier()
        const release = barrier()
        const owner = prisma.$transaction(async (tx) => {
          await tx.$queryRaw`SELECT "id" FROM "Journey" WHERE "id" = ${journeyId} FOR NO KEY UPDATE`
          held.resolve()
          await release.promise
        })
        await held.promise
        const source = prisma.block
          .update({
            where: { id: kind === 'image' ? 'image' : 'typography' },
            data: { content: 'New source' }
          })
          .then((block) => block)
        await waitForDatabaseLock()
        const attach = prisma.journey
          .update({
            where: { id: 'referrer' },
            data:
              kind === 'image'
                ? { primaryImageBlockId: 'image' }
                : { menuStepBlockId: 'step' }
          })
          .then((journey) => journey)
        try {
          await waitForDatabaseLock(2n)
          expect(await revision('referrer')).toBe(before)
        } finally {
          release.resolve()
        }
        await owner
        await source
        await attach
        expect(await revision('referrer')).toBe(before + 1n)
      }
    )

    it.each(['image', 'menu'])(
      'invalidates a shared %s when its attachment commits before the waiting source update',
      async (kind) => {
        await prisma.journey.create({
          data: {
            id: 'referrer',
            title: 'Referrer',
            slug: 'referrer',
            teamId: 'team',
            languageId: '529',
            status: 'draft'
          }
        })
        const before = await revision('referrer')
        const held = barrier()
        const release = barrier()
        const attach = prisma.$transaction(async (tx) => {
          await tx.journey.update({
            where: { id: 'referrer' },
            data:
              kind === 'image'
                ? { primaryImageBlockId: 'image' }
                : { menuStepBlockId: 'step' }
          })
          held.resolve()
          await release.promise
        })
        await held.promise
        const source = prisma.block
          .update({
            where: { id: kind === 'image' ? 'image' : 'typography' },
            data: { content: 'New source' }
          })
          .then((block) => block)
        try {
          await waitForDatabaseLock()
        } finally {
          release.resolve()
        }
        await attach
        await source
        expect(await revision('referrer')).toBe(before + 2n)
      }
    )

    it('moves chat ownership while invalidating both journeys', async () => {
      await prisma.journey.create({
        data: {
          id: 'destination',
          title: 'Destination',
          slug: 'destination',
          languageId: '529',
          teamId: 'team',
          status: 'draft'
        }
      })
      const chat = await prisma.chatButton.create({
        data: { journeyId, platform: 'facebook', link: 'original' }
      })
      const sourceRevision = await revision()
      const destinationRevision = await revision('destination')
      await accepted('chatButtonUpdate', {
        id: chat.id,
        journeyId: 'destination',
        input: { link: 'moved' }
      })
      expect(await revision()).toBe(sourceRevision + 1n)
      expect(await revision('destination')).toBe(destinationRevision + 1n)
    })

    it('detects local integration dependency changes without changing its resource', async () => {
      const integration = await prisma.integration.create({
        data: { teamId: 'team', type: 'growthSpaces' }
      })
      await prisma.block.update({
        where: { id: 'textResponse' },
        data: { integrationId: integration.id }
      })
      const before = await revision()
      await prisma.integration.update({
        where: { id: integration.id },
        data: { oauthStale: true }
      })
      expect(await revision()).toBe(before + 1n)
      await expect(
        prisma.$transaction((tx) =>
          lockDraftJourneyRevision(tx, journeyId, String(before))
        )
      ).rejects.toMatchObject({ extensions: { code: 'REVISION_CONFLICT' } })
      expect(
        (
          await prisma.integration.findUniqueOrThrow({
            where: { id: integration.id }
          })
        ).oauthStale
      ).toBe(true)
    })

    it('backfills old journeys at zero and leaves content intact', async () => {
      expect(revisionDatabase.oldWriterBlockedDuringMigration).toBe(true)
      expect(await revision('legacy')).toBe(0n)
      expect(
        (await prisma.journey.findUniqueOrThrow({ where: { id: 'legacy' } }))
          .title
      ).toBe('Legacy')
    })

    it('old direct SQL writers participate without binary changes', async () => {
      const before = await revision()
      await prisma.$executeRaw`UPDATE "Block" SET "content" = 'Old binary' WHERE "id" = 'typography'`
      expect(await revision()).toBe(before + 1n)
      await expect(
        prisma.$transaction((tx) =>
          lockDraftJourneyRevision(tx, journeyId, String(before))
        )
      ).rejects.toMatchObject({ extensions: { code: 'REVISION_CONFLICT' } })
    })

    it('missing backfill fails closed rather than inventing a revision', async () => {
      await prisma.journeyRevision.delete({ where: { journeyId } })
      await expect(
        prisma.$transaction((tx) =>
          lockDraftJourneyRevision(tx, journeyId, '0')
        )
      ).rejects.toMatchObject({
        extensions: { code: 'WRITER_FENCE_UNAVAILABLE' }
      })
    })

    it('shared image changes invalidate the referring journey without overwriting it', async () => {
      await prisma.journey.create({
        data: {
          id: 'shared',
          slug: 'shared',
          title: 'Shared',
          languageId: '529',
          teamId: 'team',
          status: 'draft'
        }
      })
      await prisma.block.create({
        data: {
          id: 'shared-image',
          journeyId: 'shared',
          typename: 'ImageBlock',
          alt: 'Before'
        }
      })
      await prisma.journey.update({
        where: { id: journeyId },
        data: { primaryImageBlockId: 'shared-image' }
      })
      const before = await revision()
      await prisma.block.update({
        where: { id: 'shared-image' },
        data: { alt: 'Later human image' }
      })
      expect(await revision()).toBe(before + 1n)
      await expect(
        prisma.$transaction((tx) =>
          lockDraftJourneyRevision(tx, journeyId, String(before))
        )
      ).rejects.toMatchObject({ extensions: { code: 'REVISION_CONFLICT' } })
      expect(
        (
          await prisma.block.findUniqueOrThrow({
            where: { id: 'shared-image' }
          })
        ).alt
      ).toBe('Later human image')
    })

    it('preserves later Host and assignment changes during a narrow content save', async () => {
      const before = await revision()
      const host = await prisma.host.create({
        data: { teamId: 'team', title: 'Human Host' }
      })
      await prisma.journey.update({
        where: { id: journeyId },
        data: { hostId: host.id }
      })
      await prisma.host.update({
        where: { id: host.id },
        data: { title: 'Later human Host' }
      })
      expect(await revision()).toBe(before)
      await prisma.$transaction(async (tx) => {
        await lockDraftJourneyRevision(tx, journeyId, String(before))
        await tx.block.update({
          where: { id: 'typography' },
          data: { content: 'Narrow edit' }
        })
      })
      expect(
        (
          await prisma.journey.findUniqueOrThrow({
            where: { id: journeyId },
            include: { host: true }
          })
        ).host
      ).toMatchObject({ id: host.id, title: 'Later human Host' })
    })
  })
})
