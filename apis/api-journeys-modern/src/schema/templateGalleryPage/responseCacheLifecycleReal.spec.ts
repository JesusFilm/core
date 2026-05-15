// Real-schema integration repro for NES-1644 / NES-1677: drive the actual
// yoga instance (with `useResponseCache` installed) through the production
// Pothos schema and assert that each mutation evicts the cached
// `templateGalleryPageBySlug` entry.
//
// The companion `responseCacheLifecycle.spec.ts` proves the *library*
// contract on a stub schema. This spec exercises the *production* schema
// (Pothos + federation + prisma plugin) for the six mutations that should
// invalidate the response cache: publish, unpublish, delete,
// assignJourney, reorderTemplate, update.
//
// Hard wiring:
// - `vi.hoisted` flips `NODE_ENV` to `production` BEFORE any imports, so
//   yoga.ts installs `useResponseCache` (gated `!== 'test'` at line 85)
//   and `useHmacSignatureValidation` (gated at line 74).
//   `production` (not `development`) is required because schema/index.ts's
//   `generate()` side-effect fires for any value other than `production`
//   or `test` and crashes on the dual-graphql-module load path under
//   vitest.
// - `@graphql-hive/gateway`'s `useHmacSignatureValidation` is replaced
//   with a no-op plugin so unsigned curl-style requests pass through.
// - `@core/yoga/firebaseClient.getUserFromPayload` is mocked to always
//   return a test user, so authed mutations don't need a real JWT.
import { type MockedFunction, vi } from 'vitest'

vi.hoisted(() => {
  // process.env.NODE_ENV is typed as readonly in node:process — use
  // Object.assign to mutate it without a `// @ts-expect-error` dance.
  Object.assign(process.env, { NODE_ENV: 'production' })
})

vi.mock('@graphql-hive/gateway', async () => {
  const actual =
    await vi.importActual<typeof import('@graphql-hive/gateway')>(
      '@graphql-hive/gateway'
    )
  return {
    ...actual,
    // Bypass HMAC validation: prod uses this to reject un-signed requests
    // from clients that are not the gateway. Test fixtures can't sign
    // requests so we replace the plugin with a no-op.
    useHmacSignatureValidation: () => ({})
  }
})

vi.mock('@core/yoga/firebaseClient', async () => {
  const actual = await vi.importActual<
    typeof import('@core/yoga/firebaseClient')
  >('@core/yoga/firebaseClient')
  return {
    ...actual,
    getUserFromPayload: vi.fn()
  }
})

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

import { buildHTTPExecutor } from '@graphql-tools/executor-http'

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

const mockUser = {
  id: 'userId',
  email: 'test@example.com',
  emailVerified: true,
  firstName: 'Test',
  lastName: 'User',
  imageUrl: null,
  roles: []
}

const PAGE_ID = 'gallery-page-id-1'
const TEAM_ID = 'team-1'
const SLUG = 'test1'

function makePage(status: 'draft' | 'published'): any {
  return {
    id: PAGE_ID,
    title: 'Test Page',
    description: '',
    slug: SLUG,
    status,
    creatorName: 'Test Creator',
    creatorImageSrc: null,
    creatorImageAlt: null,
    mediaUrl: null,
    publishedAt: status === 'published' ? new Date('2026-01-01') : null,
    teamId: TEAM_ID,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01')
  }
}

describe('NES-1677 real-schema cache lifecycle', () => {
  // Lazily import yoga AFTER hoisted env mutation, so the plugin gates
  // see NODE_ENV='production' and install `useResponseCache`.
  let yoga: typeof import('../../yoga').yoga
  let cache: typeof import('../../yoga').cache
  let executor: ReturnType<typeof buildHTTPExecutor>

  beforeAll(async () => {
    const yogaModule = await import('../../yoga')
    yoga = yogaModule.yoga
    cache = yogaModule.cache
    executor = buildHTTPExecutor({ fetch: yoga.fetch.bind({}) })
  })

  beforeEach(async () => {
    vi.clearAllMocks()
    // The response-cache is a module-level singleton — entries from a prior
    // test would leak into the next one. Flush any TemplateGalleryPage
    // entries before each test so cache-hit/miss assertions are
    // deterministic regardless of test ordering.
    await cache.invalidate([{ typename: 'TemplateGalleryPage' }])
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'userRoleId',
      userId: mockUser.id,
      roles: []
    } as any)
    prismaMock.userTeam.findFirst.mockResolvedValue({
      id: 'ut',
      teamId: TEAM_ID,
      userId: mockUser.id,
      role: 'manager'
    } as any)
    prismaMock.$transaction.mockImplementation(
      async (callback: any) => await callback(prismaMock)
    )
    // lockPage helper uses $queryRaw `SELECT 1 ... FOR UPDATE` — return
    // a benign empty result so the lock call resolves cleanly.
    prismaMock.$queryRaw.mockResolvedValue([] as any)
    prismaMock.$executeRaw.mockResolvedValue(0 as any)
  })

  // --- Documents -------------------------------------------------------
  const PAGE_BY_SLUG = graphql(`
    query PageBySlug($slug: String!) {
      templateGalleryPageBySlug(slug: $slug) {
        id
        slug
        status
      }
    }
  `)

  const PUBLISH = graphql(`
    mutation Publish($id: ID!) {
      templateGalleryPagePublish(id: $id) {
        id
        status
      }
    }
  `)

  const UNPUBLISH = graphql(`
    mutation Unpublish($id: ID!) {
      templateGalleryPageUnpublish(id: $id) {
        id
        status
      }
    }
  `)

  const DELETE = graphql(`
    mutation Delete($id: ID!) {
      templateGalleryPageDelete(id: $id) {
        id
      }
    }
  `)

  const ASSIGN_JOURNEY = graphql(`
    mutation Assign($journeyId: ID!, $pageId: ID) {
      templateGalleryPageAssignJourney(
        journeyId: $journeyId
        pageId: $pageId
      ) {
        id
      }
    }
  `)

  const REORDER = graphql(`
    mutation Reorder($pageId: ID!, $journeyId: ID!, $order: Int!) {
      templateGalleryPageReorderTemplate(
        pageId: $pageId
        journeyId: $journeyId
        order: $order
      ) {
        id
      }
    }
  `)

  const UPDATE = graphql(`
    mutation Update($id: ID!, $input: TemplateGalleryPageUpdateInput!) {
      templateGalleryPageUpdate(id: $id, input: $input) {
        id
      }
    }
  `)

  // --- Helpers ---------------------------------------------------------

  async function queryPublic() {
    const res = (await executor({
      document: PAGE_BY_SLUG,
      variables: { slug: SLUG }
    })) as { data?: { templateGalleryPageBySlug: any } }
    return res.data?.templateGalleryPageBySlug ?? null
  }

  // Each mutation's mocks for a "happy-path success that should invalidate".
  // Mocked once-per-call so each test sets them up independently and the
  // queue is exhausted by the end of the test.
  function setupPublishHappy() {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValueOnce(
      makePage('draft')
    )
    prismaMock.templateGalleryPage.updateMany.mockResolvedValueOnce({
      count: 1
    } as any)
    prismaMock.templateGalleryPage.findUniqueOrThrow.mockResolvedValueOnce(
      makePage('published')
    )
  }

  function setupUnpublishHappy() {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValueOnce(
      makePage('published')
    )
    prismaMock.templateGalleryPage.updateMany.mockResolvedValueOnce({
      count: 1
    } as any)
    prismaMock.templateGalleryPage.findUniqueOrThrow.mockResolvedValueOnce(
      makePage('draft')
    )
  }

  function setupDeleteHappy() {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValueOnce(
      makePage('published')
    )
    prismaMock.templateGalleryPage.delete.mockResolvedValueOnce(
      makePage('published') as any
    )
  }

  // Assign branch: existing membership found (so the no-op short-circuit
  // does NOT fire — we want the path that actually invalidates).
  function setupAssignHappy() {
    prismaMock.templateGalleryPageTemplate.findFirst.mockResolvedValueOnce({
      id: 'tpl-row-1',
      templateGalleryPageId: 'source-page'
    } as any)
    prismaMock.templateGalleryPage.findUniqueOrThrow.mockResolvedValueOnce({
      id: 'source-page',
      teamId: TEAM_ID
    } as any)
    prismaMock.templateGalleryPageTemplate.delete.mockResolvedValueOnce({
      id: 'tpl-row-1'
    } as any)
    // renumberPage's findMany inside the source-page branch
    prismaMock.templateGalleryPageTemplate.findMany.mockResolvedValueOnce([])
    prismaMock.templateGalleryPage.findUniqueOrThrow.mockResolvedValueOnce(
      makePage('published') as any
    )
  }

  function setupReorderHappy() {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValueOnce({
      id: PAGE_ID,
      teamId: TEAM_ID
    } as any)
    prismaMock.templateGalleryPageTemplate.findMany.mockResolvedValueOnce([
      { id: 'row-1', journeyId: 'j1' },
      { id: 'row-2', journeyId: 'j2' }
    ] as any)
    prismaMock.templateGalleryPageTemplate.update.mockResolvedValue({
      id: 'row-1'
    } as any)
    prismaMock.templateGalleryPage.findUniqueOrThrow.mockResolvedValueOnce(
      makePage('published')
    )
  }

  function setupUpdateHappy() {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValueOnce({
      id: PAGE_ID,
      teamId: TEAM_ID
    } as any)
    prismaMock.templateGalleryPage.update.mockResolvedValueOnce(
      makePage('published')
    )
  }

  // --- #8 Plugin-installed sanity test ---------------------------------
  //
  // If `useResponseCache` isn't installed for any reason (NODE_ENV race,
  // future vitest config change, plugin gating regression), the cache plugin
  // is silently absent and every read hits Prisma. Without this assertion,
  // the lifecycle tests below pass for the wrong reason (Prisma is mocked,
  // returns fresh data every time, post-mutation reads appear correct).
  //
  // Strategy: prime the cache with a single mockResolvedValueOnce. Issue
  // two identical reads. If the plugin is installed, the second is a cache
  // hit — Prisma is called exactly once. If the plugin is NOT installed,
  // the second findFirst has no queued value and findFirst is called twice.
  it('useResponseCache plugin is installed (second identical read is a cache hit)', async () => {
    prismaMock.templateGalleryPage.findFirst.mockResolvedValueOnce(
      makePage('published')
    )

    const first = await queryPublic()
    expect(first).toMatchObject({ id: PAGE_ID, status: 'published' })
    expect(prismaMock.templateGalleryPage.findFirst).toHaveBeenCalledTimes(1)

    const second = await queryPublic()
    expect(second).toMatchObject({ id: PAGE_ID, status: 'published' })
    // Cache hit: the plugin served the second read without touching Prisma.
    expect(prismaMock.templateGalleryPage.findFirst).toHaveBeenCalledTimes(1)
  })

  // --- The canonical NES-1644 lifecycle ---------------------------------
  it('post-republish public read returns fresh published, not stale null', async () => {
    // 1. Initial state: page is published. Prime the cache.
    prismaMock.templateGalleryPage.findFirst.mockResolvedValueOnce(
      makePage('published')
    )
    const initial = await queryPublic()
    expect(initial).toMatchObject({ id: PAGE_ID, status: 'published' })

    // 2. Unpublish.
    setupUnpublishHappy()
    await executor({ document: UNPUBLISH, variables: { id: PAGE_ID } })

    // 3. Public query during draft window → null (filter rejects).
    prismaMock.templateGalleryPage.findFirst.mockResolvedValueOnce(null)
    const draft = await queryPublic()
    expect(draft).toBeNull()

    // 4. Republish.
    setupPublishHappy()
    await executor({ document: PUBLISH, variables: { id: PAGE_ID } })

    // 5. THE CRITICAL ASSERTION: post-republish must return the freshly
    //    published entity. If the cache served the stale-null from step 3
    //    (the NES-1644 bug fingerprint), this returns null and the test
    //    fails — reproducing what Siyang sees in the browser.
    prismaMock.templateGalleryPage.findFirst.mockResolvedValueOnce(
      makePage('published')
    )
    const republished = await queryPublic()
    expect(republished).toMatchObject({ id: PAGE_ID, status: 'published' })
  })

  // --- #3 Parametrized per-mutation eviction tests ----------------------
  describe.each([
    {
      name: 'publish',
      setup: setupPublishHappy,
      document: PUBLISH,
      variables: { id: PAGE_ID }
    },
    {
      name: 'unpublish',
      setup: setupUnpublishHappy,
      document: UNPUBLISH,
      variables: { id: PAGE_ID }
    },
    {
      name: 'delete',
      setup: setupDeleteHappy,
      document: DELETE,
      variables: { id: PAGE_ID }
    },
    {
      name: 'assignJourney (unassign with existing membership)',
      setup: setupAssignHappy,
      document: ASSIGN_JOURNEY,
      variables: { journeyId: 'j1', pageId: null }
    },
    {
      name: 'reorderTemplate',
      setup: setupReorderHappy,
      document: REORDER,
      variables: { pageId: PAGE_ID, journeyId: 'j1', order: 1 }
    },
    {
      name: 'update',
      setup: setupUpdateHappy,
      document: UPDATE,
      variables: { id: PAGE_ID, input: { title: 'New Title' } }
    }
  ])('$name', ({ setup, document, variables }) => {
    it('evicts the cached templateGalleryPageBySlug entry after a successful mutation', async () => {
      // Prime the cache and confirm the second read is a hit.
      prismaMock.templateGalleryPage.findFirst.mockResolvedValueOnce(
        makePage('published')
      )
      await queryPublic()
      expect(prismaMock.templateGalleryPage.findFirst).toHaveBeenCalledTimes(1)
      await queryPublic()
      expect(prismaMock.templateGalleryPage.findFirst).toHaveBeenCalledTimes(1)

      // Run the mutation — it should evict the cached entry.
      setup()
      await executor({
        document,
        variables: variables as any
      })

      // The next public read MUST hit Prisma again. If it doesn't, the
      // mutation didn't invalidate (regression).
      prismaMock.templateGalleryPage.findFirst.mockResolvedValueOnce(
        makePage('published')
      )
      await queryPublic()
      expect(prismaMock.templateGalleryPage.findFirst).toHaveBeenCalledTimes(2)
    })
  })

  // --- #9 cache.invalidate rejection: fail-loudly post-commit contract --
  it('surfaces a cache.invalidate rejection to the client AFTER the Prisma transaction commits', async () => {
    // Set up the publish success path so the TX itself commits.
    setupPublishHappy()

    // Inject a one-shot cache.invalidate failure.
    const invalidateError = new Error('cache backend down')
    const invalidateSpy = vi
      .spyOn(cache, 'invalidate')
      .mockRejectedValueOnce(invalidateError)

    const res = (await executor({
      document: PUBLISH,
      variables: { id: PAGE_ID }
    })) as { data?: any; errors?: unknown[] }

    // DB transaction DID commit: updateMany was called with count=1 path.
    expect(prismaMock.templateGalleryPage.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: PAGE_ID, status: 'draft' }
      })
    )
    // At least one invalidate call — the resolver's explicit one. The
    // useResponseCache plugin also calls `invalidate(...)` on its own to
    // process the mutation's entity-ID set, so the count may be > 1; we
    // only need to confirm the rejection path surfaced an error.
    expect(invalidateSpy.mock.calls.length).toBeGreaterThanOrEqual(1)

    // The GraphQL response surfaces the error rather than silently
    // succeeding with stale-cache risk. Pothos masks the error message in
    // production NODE_ENV, but the `errors` array is populated — the
    // "fail loudly" contract from the plan.
    expect(res.errors).toBeDefined()
    expect((res.errors ?? []).length).toBeGreaterThan(0)
  })
})
