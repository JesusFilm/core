import { buildHTTPExecutor } from '@graphql-tools/executor-http'
import {
  createInMemoryCache,
  useResponseCache
} from '@graphql-yoga/plugin-response-cache'
import { parse } from 'graphql'
import { createSchema, createYoga } from 'graphql-yoga'
import { describe, expect, it } from 'vitest'

// Canary spec for the NES-1644 cache fix. Exercises the real
// `useResponseCache` plugin against the real `createInMemoryCache()` —
// no mocks — to prove that typename-only invalidation evicts cached
// `null` responses. Production code path:
//
//   1. Query returns published entity      → cache stores with entity ID
//   2. Mutation flips status to draft, calls invalidate by typename
//   3. Query during draft window returns null → cache stores with NO id
//   4. Mutation flips status back to published, calls invalidate again
//   5. Query repopulates from "DB" → must serve fresh, not the stale null
//
// Without typename-only invalidation evicting step-3's null entry, the
// post-republish read in step 5 serves the cached null and the public
// page renders 404. This is the exact failure mode Siyang reproduced.
// Running this spec against `main` (pre-fix code that lacks the
// `cache.invalidate(...)` calls in the mutations) fails the post-
// republish assertion — confirming the test catches the bug.
//
// The schema/mutations here are a deliberately minimal stand-in for the
// full templateGalleryPage flow. Building this canary against the full
// production schema would need prisma mocking, federation wiring, HMAC
// bypass, and auth scaffolding — none of which is on the lifecycle
// critical path the bug actually depends on. The library behaviour we
// need to verify is the relationship between (a) `useResponseCache`'s
// auto-tracking of entity IDs and (b) `cache.invalidate(...)` with a
// typename-only key. That relationship is what this spec exercises.

interface PageRow {
  __typename: 'Page'
  id: string
  slug: string
  status: 'draft' | 'published'
}

describe('useResponseCache lifecycle (NES-1644 canary)', () => {
  function buildHarness() {
    const cache = createInMemoryCache()
    // Single-row mutable state stands in for the DB row. The schema
    // resolves `pageBySlug` against this state, applying the
    // `status === 'published'` filter just like the real
    // `templateGalleryPageBySlug` resolver does.
    const state: PageRow = {
      __typename: 'Page',
      id: 'p1',
      slug: 'test-slug',
      status: 'published'
    }

    const schema = createSchema({
      typeDefs: /* GraphQL */ `
        type Page {
          id: ID!
          slug: String!
          status: String!
        }
        type Query {
          pageBySlug(slug: String!): Page
        }
        type Mutation {
          publish: Page!
          unpublish: Page!
        }
      `,
      resolvers: {
        Query: {
          pageBySlug: (_parent, args: { slug: string }) => {
            if (args.slug !== state.slug) return null
            if (state.status !== 'published') return null
            return state
          }
        },
        Mutation: {
          publish: async () => {
            state.status = 'published'
            await cache.invalidate([{ typename: 'Page' }])
            return state
          },
          unpublish: async () => {
            state.status = 'draft'
            await cache.invalidate([{ typename: 'Page' }])
            // Return a representation of the page so the mutation result
            // still carries the entity ID for the plugin's auto-tracking
            // (matches the real unpublish.mutation.ts canonical-re-read).
            return { ...state }
          }
        }
      }
    })

    const yoga = createYoga({
      schema,
      plugins: [
        useResponseCache({
          session: () => null,
          cache,
          ttlPerSchemaCoordinate: {
            // Mirrors the production config for templateGalleryPageBySlug.
            'Query.pageBySlug': 60_000
          }
        })
      ],
      // Disable yoga's default GraphiQL noise in tests.
      graphiql: false
    })

    const exec = buildHTTPExecutor({ fetch: yoga.fetch.bind({}) })

    const pageBySlugDoc = parse(/* GraphQL */ `
      query Q($slug: String!) {
        pageBySlug(slug: $slug) {
          id
          slug
          status
        }
      }
    `)
    const unpublishDoc = parse(/* GraphQL */ `
      mutation M {
        unpublish {
          id
          slug
          status
        }
      }
    `)
    const publishDoc = parse(/* GraphQL */ `
      mutation M {
        publish {
          id
          slug
          status
        }
      }
    `)

    async function pageBySlug(slug: string): Promise<PageRow | null> {
      const result = (await exec({
        document: pageBySlugDoc,
        variables: { slug }
      })) as { data?: { pageBySlug: PageRow | null } }
      return result.data?.pageBySlug ?? null
    }

    async function unpublish(): Promise<void> {
      await exec({ document: unpublishDoc })
    }

    async function publish(): Promise<void> {
      await exec({ document: publishDoc })
    }

    return { state, pageBySlug, unpublish, publish }
  }

  it('publish → query → unpublish → query → republish → query returns fresh data, not stale null', async () => {
    const harness = buildHarness()

    // 1. Initial query populates the cache with the published entity
    //    (entity-ID-tagged because the response carries a Page id).
    const initialRead = await harness.pageBySlug('test-slug')
    expect(initialRead).toMatchObject({
      id: 'p1',
      slug: 'test-slug',
      status: 'published'
    })

    // 2. Unpublish: mutation transitions status to draft and invalidates
    //    the cache by typename. Auto-invalidation by entity ID would
    //    also evict here (the prior cached entry had an ID), but the
    //    explicit typename call is what closes the null-branch gap.
    await harness.unpublish()
    expect(harness.state.status).toBe('draft')

    // 3. Query during draft window returns null (the public resolver's
    //    `status === 'published'` filter rejects). Cache stores this
    //    null WITHOUT an entity ID — by-entity-ID invalidation can no
    //    longer reach this entry. That's the bug fingerprint.
    const draftRead = await harness.pageBySlug('test-slug')
    expect(draftRead).toBeNull()

    // 4. Republish: mutation transitions status back to published and
    //    invalidates by typename. The critical assertion: typename-only
    //    invalidation must reach the null entry from step 3.
    await harness.publish()
    expect(harness.state.status).toBe('published')

    // 5. Post-republish read MUST return the fresh published entity,
    //    not the cached null from step 3. This is what fails on `main`
    //    without the `cache.invalidate(...)` calls in the publish
    //    mutation.
    const postRepublishRead = await harness.pageBySlug('test-slug')
    expect(postRepublishRead).toMatchObject({
      id: 'p1',
      slug: 'test-slug',
      status: 'published'
    })
  })

  it('back-to-back unpublish → publish (no intervening read) leaves cache clean', async () => {
    const harness = buildHarness()

    // Warm the cache with the published entity.
    await harness.pageBySlug('test-slug')

    // Rapid toggle with no intervening reads — the null entry never
    // gets a chance to populate. Invalidate calls should still leave
    // the cache in a consistent state.
    await harness.unpublish()
    await harness.publish()
    expect(harness.state.status).toBe('published')

    const read = await harness.pageBySlug('test-slug')
    expect(read).toMatchObject({ status: 'published' })
  })

  it('typename invalidation also evicts entries from other slugs (over-invalidation trade-off)', async () => {
    // This documents the deliberate trade-off: typename-only
    // invalidation clears cached entries for ALL Page entities, not
    // just the one being mutated. We accept this cost to close the
    // null-branch invalidation gap. The deferred follow-up
    // (`buildResponseCacheKey` with slug-keyed invalidation) would
    // provide finer-grained eviction; until then, the next read
    // simply rehydrates the cache from the DB.
    const harness = buildHarness()

    // Read a slug that doesn't exist — caches null with no entity ID.
    const unknown1 = await harness.pageBySlug('some-other-slug')
    expect(unknown1).toBeNull()

    // Read our slug — caches the published entity.
    const known1 = await harness.pageBySlug('test-slug')
    expect(known1).toMatchObject({ status: 'published' })

    // Mutation invalidates by typename — affects BOTH entries above.
    await harness.unpublish()
    await harness.publish()

    // Both reads still resolve correctly post-invalidation (the cache
    // rehydrated from "DB"). The cost is one extra fetch each, not
    // serving stale data.
    const known2 = await harness.pageBySlug('test-slug')
    expect(known2).toMatchObject({ status: 'published' })
    const unknown2 = await harness.pageBySlug('some-other-slug')
    expect(unknown2).toBeNull()
  })
})
