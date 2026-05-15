// Real-schema integration repro for NES-1644: drive the actual yoga
// instance (with `useResponseCache` installed) through the publish →
// query → unpublish → query → publish → query lifecycle and assert the
// final read returns the freshly republished entity, not the cached
// `null` from the draft window.
//
// The existing `responseCacheLifecycle.spec.ts` proved the *library*
// contract on a stub schema. This spec exercises the *production*
// schema (Pothos + federation + prisma plugin) to confirm the fix
// holds under the real type graph that ships in api-journeys-modern.
//
// Hard wiring:
// - `vi.hoisted` flips `NODE_ENV` to `development` BEFORE any imports,
//   so yoga.ts installs `useResponseCache` (gated `!== 'test'` at line
//   85) and `useHmacSignatureValidation` (gated at line 74).
// - `@graphql-hive/gateway`'s `useHmacSignatureValidation` is replaced
//   with a no-op plugin so unsigned curl-style requests pass through.
// - `@core/yoga/firebaseClient.getUserFromPayload` is mocked to always
//   return a test user, so authed mutations don't need a real JWT.
import { type MockedFunction, vi } from 'vitest'

vi.hoisted(() => {
  // Must run before any import that reads NODE_ENV. yoga.ts:74/85
  // gate `useHmacSignatureValidation` and `useResponseCache` on
  // `NODE_ENV !== 'test'`. We use 'production' (not 'development')
  // because schema/index.ts's `generate()` side-effect fires for any
  // value other than 'production' or 'test' and crashes on the dual-
  // graphql-module load path under vitest.
  process.env.NODE_ENV = 'production'
})

vi.mock('@graphql-hive/gateway', async () => {
  const actual =
    await vi.importActual<typeof import('@graphql-hive/gateway')>(
      '@graphql-hive/gateway'
    )
  return {
    ...actual,
    // Bypass HMAC validation: prod uses this to reject un-signed
    // requests from clients that are not the gateway. Test fixtures
    // can't sign requests so we replace the plugin with a no-op.
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

function makePage(status: 'draft' | 'published') {
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
  } as any
}

describe('NES-1644 real-schema lifecycle', () => {
  // Lazily import yoga AFTER hoisted env mutation, so the plugin gates
  // see NODE_ENV='development' and install `useResponseCache`.
  let yoga: typeof import('../../yoga').yoga
  let executor: ReturnType<typeof buildHTTPExecutor>

  beforeAll(async () => {
    const yogaModule = await import('../../yoga')
    yoga = yogaModule.yoga
    executor = buildHTTPExecutor({ fetch: yoga.fetch.bind({}) })
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    // userRole.findUnique is called per-request in yoga context to
    // populate currentRoles; default to no roles.
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
  })

  // --- Query (public) ---------------------------------------------------
  const PAGE_BY_SLUG = graphql(`
    query PageBySlug($slug: String!) {
      templateGalleryPageBySlug(slug: $slug) {
        id
        slug
        status
      }
    }
  `)

  // --- Mutations (authenticated) ----------------------------------------
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

  async function queryPublic() {
    const res = (await executor({
      document: PAGE_BY_SLUG,
      variables: { slug: SLUG }
    })) as { data?: { templateGalleryPageBySlug: any } }
    return res.data?.templateGalleryPageBySlug ?? null
  }

  async function publishAs(status: 'draft' | 'published') {
    // Mirror the publish mutation's prisma sequence:
    //  1. findUnique to authorize + read current status
    //  2. (conditional) updateMany draft → published
    //  3. findUniqueOrThrow for canonical re-read
    prismaMock.templateGalleryPage.findUnique.mockResolvedValueOnce(
      makePage(status)
    )
    prismaMock.templateGalleryPage.updateMany.mockResolvedValueOnce({
      count: status === 'draft' ? 1 : 0
    } as any)
    prismaMock.templateGalleryPage.findUniqueOrThrow.mockResolvedValueOnce(
      makePage('published')
    )
    return await executor({
      document: PUBLISH,
      variables: { id: PAGE_ID },
      extensions: { jwt: { payload: { id: mockUser.id } } }
    })
  }

  async function unpublishAs(status: 'draft' | 'published') {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValueOnce(
      makePage(status)
    )
    prismaMock.templateGalleryPage.updateMany.mockResolvedValueOnce({
      count: status === 'published' ? 1 : 0
    } as any)
    prismaMock.templateGalleryPage.findUniqueOrThrow.mockResolvedValueOnce(
      makePage('draft')
    )
    return await executor({
      document: UNPUBLISH,
      variables: { id: PAGE_ID },
      extensions: { jwt: { payload: { id: mockUser.id } } }
    })
  }

  it('post-republish public read returns fresh published, not stale null', async () => {
    // 1. Initial state: page is published. Prime the cache.
    prismaMock.templateGalleryPage.findFirst.mockResolvedValueOnce(
      makePage('published')
    )
    const initial = await queryPublic()
    expect(initial).toMatchObject({ id: PAGE_ID, status: 'published' })

    // 2. Unpublish.
    await unpublishAs('published')

    // 3. Public query during draft window → null (filter rejects).
    prismaMock.templateGalleryPage.findFirst.mockResolvedValueOnce(null)
    const draft = await queryPublic()
    expect(draft).toBeNull()

    // 4. Republish.
    await publishAs('draft')

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
})
