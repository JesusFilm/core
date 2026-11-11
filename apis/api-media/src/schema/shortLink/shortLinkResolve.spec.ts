import { vi } from 'vitest'

import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import {
  buildShortLinkDomain,
  buildShortLinkWithDomain,
  withRelations
} from '../../../test/shortLinkFixtures'

vi.mock('./edge', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./edge')>()),
  publishLink: vi.fn(),
  unpublishLink: vi.fn(),
  publishDomain: vi.fn(),
  publishDomainWithLinks: vi.fn(),
  unpublishDomain: vi.fn()
}))

const SHORT_LINK_RESOLVE_QUERY = graphql(`
  query ShortLinkResolveQuery($hostname: String!, $pathname: String!) {
    shortLinkResolve(hostname: $hostname, pathname: $pathname) {
      found
      location
      status
      source
      shortLink {
        id
        pathname
      }
    }
  }
`)

describe('shortLinkResolve', () => {
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: { id: 'userId' } }
  })

  async function resolve(hostname: string, pathname: string): Promise<unknown> {
    const result = await authClient({
      document: SHORT_LINK_RESOLVE_QUERY,
      variables: { hostname, pathname }
    })
    return result
  }

  beforeEach(() => {
    prismaMock.userMediaRole.findUnique.mockResolvedValue({
      id: 'userId',
      userId: 'testUserId',
      roles: ['shortLinkEditor'],
      createdAt: new Date(),
      updatedAt: new Date()
    })
  })

  it('answers the lost page for an unknown host', async () => {
    prismaMock.shortLinkDomain.findUnique.mockResolvedValue(null)
    expect(await resolve('Unknown.example', 'abc')).toEqual({
      data: {
        shortLinkResolve: {
          found: false,
          location: null,
          status: 404,
          source: 'lostPage',
          shortLink: null
        }
      }
    })
    expect(prismaMock.shortLinkDomain.findUnique).toHaveBeenCalledWith({
      where: { hostname: 'unknown.example' }
    })
  })

  it('resolves an active link with the effective status', async () => {
    prismaMock.shortLinkDomain.findUnique.mockResolvedValue(
      buildShortLinkDomain({ redirectStatus: 307 })
    )
    prismaMock.shortLink.findFirst.mockResolvedValue(
      withRelations(
        buildShortLinkWithDomain({
          to: 'https://dest.example',
          redirectStatus: 301
        }),
        {
          campaigns: []
        }
      )
    )
    expect(await resolve('example.com', '/testPath')).toEqual({
      data: {
        shortLinkResolve: {
          found: true,
          location: 'https://dest.example',
          status: 301,
          source: 'link',
          shortLink: { id: 'testId', pathname: 'testPath' }
        }
      }
    })
    expect(prismaMock.shortLink.findFirst).toHaveBeenCalledWith({
      where: {
        domainId: 'domainId',
        pathname: 'testPath',
        deletedAt: null,
        status: { not: 'retired' }
      },
      include: { domain: true, campaigns: true }
    })
  })

  it('lower-cases the pathname on a case-insensitive domain', async () => {
    prismaMock.shortLinkDomain.findUnique.mockResolvedValue(
      buildShortLinkDomain({ slugCaseSensitive: false })
    )
    prismaMock.shortLink.findFirst.mockResolvedValue(null)
    await resolve('example.com', 'MixedCase')
    expect(prismaMock.shortLink.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ pathname: 'mixedcase' })
      })
    )
  })

  it('routes a Brightcove arc.gt link through the passthrough origin', async () => {
    prismaMock.shortLinkDomain.findUnique.mockResolvedValue(
      buildShortLinkDomain({
        hostname: 'arc.gt',
        redirectStatus: 302,
        notFound: 'passthrough',
        passthroughOrigin: 'https://api.arclight.org'
      })
    )
    prismaMock.shortLink.findFirst.mockResolvedValue(
      withRelations(
        buildShortLinkWithDomain(
          {
            pathname: 'abc123',
            brightcoveId: '1',
            redirectType: 'hls'
          },
          {
            hostname: 'arc.gt',
            redirectStatus: 302,
            passthroughOrigin: 'https://api.arclight.org'
          }
        ),
        {
          campaigns: []
        }
      )
    )
    expect(await resolve('arc.gt', 'abc123')).toMatchObject({
      data: {
        shortLinkResolve: {
          found: true,
          location: 'https://api.arclight.org/abc123',
          status: 302,
          source: 'link'
        }
      }
    })
  })

  it('uses the link fallback for a paused link', async () => {
    prismaMock.shortLinkDomain.findUnique.mockResolvedValue(
      buildShortLinkDomain({ fallbackTo: 'https://domain-fallback.example' })
    )
    prismaMock.shortLink.findFirst.mockResolvedValue(
      withRelations(
        buildShortLinkWithDomain({
          status: 'paused',
          fallbackTo: 'https://link-fallback.example'
        }),
        {
          campaigns: []
        }
      )
    )
    expect(await resolve('example.com', 'testPath')).toMatchObject({
      data: {
        shortLinkResolve: {
          found: true,
          location: 'https://link-fallback.example',
          status: 307,
          source: 'linkFallback',
          shortLink: { id: 'testId' }
        }
      }
    })
  })

  it('uses the domain fallback for a paused link without its own', async () => {
    prismaMock.shortLinkDomain.findUnique.mockResolvedValue(
      buildShortLinkDomain({ fallbackTo: 'https://domain-fallback.example' })
    )
    prismaMock.shortLink.findFirst.mockResolvedValue(
      withRelations(buildShortLinkWithDomain({ status: 'paused' }), {
        campaigns: []
      })
    )
    expect(await resolve('example.com', 'testPath')).toMatchObject({
      data: {
        shortLinkResolve: {
          found: true,
          location: 'https://domain-fallback.example',
          source: 'domainFallback'
        }
      }
    })
  })

  it('falls through to the not-found behaviour for a paused link without any fallback', async () => {
    prismaMock.shortLinkDomain.findUnique.mockResolvedValue(
      buildShortLinkDomain()
    )
    prismaMock.shortLink.findFirst.mockResolvedValue(
      withRelations(buildShortLinkWithDomain({ status: 'paused' }), {
        campaigns: []
      })
    )
    expect(await resolve('example.com', 'testPath')).toMatchObject({
      data: {
        shortLinkResolve: {
          found: false,
          location: null,
          status: 404,
          source: 'lostPage',
          shortLink: { id: 'testId' }
        }
      }
    })
  })

  describe('global fallback', () => {
    const claim = {
      pathname: 'promo',
      shortLinkId: 'g1',
      createdAt: new Date()
    }
    const globalLink = withRelations(
      buildShortLinkWithDomain(
        {
          id: 'g1',
          pathname: 'promo',
          to: 'https://global.example',
          global: true
        },
        { id: 'otherDomain', hostname: 'other.example', redirectStatus: 301 }
      ),
      { campaigns: [] }
    )

    it('serves a live global link with the requesting domain status', async () => {
      prismaMock.shortLinkDomain.findUnique.mockResolvedValue(
        buildShortLinkDomain({ slugCaseSensitive: false, redirectStatus: 302 })
      )
      prismaMock.shortLink.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(globalLink)
      prismaMock.shortLinkGlobalSlug.findUnique.mockResolvedValue(claim)
      expect(await resolve('example.com', 'Promo')).toEqual({
        data: {
          shortLinkResolve: {
            found: true,
            location: 'https://global.example',
            status: 302,
            source: 'link',
            shortLink: { id: 'g1', pathname: 'promo' }
          }
        }
      })
      expect(prismaMock.shortLinkGlobalSlug.findUnique).toHaveBeenCalledWith({
        where: { pathname: 'promo' },
        select: { shortLinkId: true }
      })
      expect(prismaMock.shortLink.findFirst).toHaveBeenLastCalledWith({
        where: {
          id: 'g1',
          global: true,
          deletedAt: null,
          status: { not: 'retired' }
        },
        include: { domain: true, campaigns: true }
      })
    })

    it('uses the requesting domain fallback for a paused global link', async () => {
      prismaMock.shortLinkDomain.findUnique.mockResolvedValue(
        buildShortLinkDomain({ fallbackTo: 'https://domain-fallback.example' })
      )
      prismaMock.shortLink.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ ...globalLink, status: 'paused' })
      prismaMock.shortLinkGlobalSlug.findUnique.mockResolvedValue(claim)
      expect(await resolve('example.com', 'promo')).toMatchObject({
        data: {
          shortLinkResolve: {
            found: true,
            location: 'https://domain-fallback.example',
            source: 'domainFallback',
            shortLink: { id: 'g1' }
          }
        }
      })
    })

    it('does not serve a claimed pathname whose link is no longer live', async () => {
      prismaMock.shortLinkDomain.findUnique.mockResolvedValue(
        buildShortLinkDomain()
      )
      prismaMock.shortLink.findFirst.mockResolvedValue(null)
      prismaMock.shortLinkGlobalSlug.findUnique.mockResolvedValue(claim)
      expect(await resolve('example.com', 'promo')).toMatchObject({
        data: { shortLinkResolve: { found: false, source: 'lostPage' } }
      })
    })
  })

  describe('unknown paths', () => {
    beforeEach(() => {
      prismaMock.shortLink.findFirst.mockResolvedValue(null)
    })

    it('answers the lost page on a lostPage domain', async () => {
      prismaMock.shortLinkDomain.findUnique.mockResolvedValue(
        buildShortLinkDomain({ notFound: 'lostPage' })
      )
      expect(await resolve('example.com', 'nope')).toMatchObject({
        data: {
          shortLinkResolve: {
            found: false,
            location: null,
            status: 404,
            source: 'lostPage'
          }
        }
      })
    })

    it('redirects to the domain fallback on a fallback domain', async () => {
      prismaMock.shortLinkDomain.findUnique.mockResolvedValue(
        buildShortLinkDomain({
          notFound: 'fallback',
          fallbackTo: 'https://fallback.example',
          redirectStatus: 302
        })
      )
      expect(await resolve('example.com', 'nope')).toMatchObject({
        data: {
          shortLinkResolve: {
            found: false,
            location: 'https://fallback.example',
            status: 302,
            source: 'domainFallback'
          }
        }
      })
    })

    it('passes the path through on a passthrough domain', async () => {
      prismaMock.shortLinkDomain.findUnique.mockResolvedValue(
        buildShortLinkDomain({
          hostname: 'arc.gt',
          notFound: 'passthrough',
          passthroughOrigin: 'https://api.arclight.org',
          redirectStatus: 302
        })
      )
      expect(await resolve('arc.gt', 'unknown-keyword')).toMatchObject({
        data: {
          shortLinkResolve: {
            found: false,
            location: 'https://api.arclight.org/unknown-keyword',
            status: 302,
            source: 'passthrough'
          }
        }
      })
    })

    it('does not look up paths that fail the edge grammar', async () => {
      prismaMock.shortLinkDomain.findUnique.mockResolvedValue(
        buildShortLinkDomain()
      )
      expect(await resolve('example.com', 'a/b')).toMatchObject({
        data: { shortLinkResolve: { found: false, source: 'lostPage' } }
      })
      expect(await resolve('example.com', '')).toMatchObject({
        data: { shortLinkResolve: { found: false, source: 'lostPage' } }
      })
      expect(prismaMock.shortLink.findFirst).not.toHaveBeenCalled()
    })
  })

  it('reports reserved paths with the domain not-found behaviour', async () => {
    prismaMock.shortLinkDomain.findUnique.mockResolvedValue(
      buildShortLinkDomain({
        hostname: 'arc.gt',
        reservedPaths: ['s', 'hls'],
        notFound: 'passthrough',
        passthroughOrigin: 'https://api.arclight.org',
        redirectStatus: 302
      })
    )
    expect(await resolve('arc.gt', '/hls/123')).toEqual({
      data: {
        shortLinkResolve: {
          found: false,
          location: 'https://api.arclight.org/hls/123',
          status: 302,
          source: 'reserved',
          shortLink: null
        }
      }
    })
    expect(prismaMock.shortLink.findFirst).not.toHaveBeenCalled()
  })

  it('refuses a caller without a short link role', async () => {
    prismaMock.userMediaRole.findUnique.mockResolvedValue({
      id: 'userId',
      userId: 'testUserId',
      roles: ['youtubeAdmin'],
      createdAt: new Date(),
      updatedAt: new Date()
    })
    expect(await resolve('example.com', 'abc')).toMatchObject({
      errors: [expect.anything()]
    })
  })
})
