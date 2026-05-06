import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

jest.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: jest.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as jest.MockedFunction<
  typeof getUserFromPayload
>

describe('templateGalleryPageBySlug', () => {
  const publicClient = getClient()

  const TEMPLATE_GALLERY_PAGE_BY_SLUG = graphql(`
    query TemplateGalleryPageBySlug($slug: String!) {
      templateGalleryPageBySlug(slug: $slug) {
        id
        title
        slug
        status
      }
    }
  `)

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(null)
  })

  it('returns a published page to an unauthenticated visitor', async () => {
    prismaMock.templateGalleryPage.findFirst.mockResolvedValue({
      id: 'p1',
      title: 'Hello',
      slug: 'hello',
      status: 'published'
    } as any)

    const result = await publicClient({
      document: TEMPLATE_GALLERY_PAGE_BY_SLUG,
      variables: { slug: 'hello' }
    })

    expect(result).toEqual({
      data: {
        templateGalleryPageBySlug: {
          id: 'p1',
          title: 'Hello',
          slug: 'hello',
          status: 'published'
        }
      }
    })
    expect(prismaMock.templateGalleryPage.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'hello', status: 'published' }
      })
    )
  })

  it('returns null when slug is unknown', async () => {
    prismaMock.templateGalleryPage.findFirst.mockResolvedValue(null)

    const result = await publicClient({
      document: TEMPLATE_GALLERY_PAGE_BY_SLUG,
      variables: { slug: 'missing' }
    })

    expect(result).toEqual({
      data: { templateGalleryPageBySlug: null }
    })
  })

  it('returns null without hitting the DB when slug is malformed', async () => {
    const result = await publicClient({
      document: TEMPLATE_GALLERY_PAGE_BY_SLUG,
      variables: { slug: 'NOT VALID!!' }
    })

    expect(result).toEqual({
      data: { templateGalleryPageBySlug: null }
    })
    expect(prismaMock.templateGalleryPage.findFirst).not.toHaveBeenCalled()
  })

  it('returns null without hitting the DB when slug exceeds max length', async () => {
    const longSlug = 'a'.repeat(201)
    const result = await publicClient({
      document: TEMPLATE_GALLERY_PAGE_BY_SLUG,
      variables: { slug: longSlug }
    })

    expect(result).toEqual({
      data: { templateGalleryPageBySlug: null }
    })
    expect(prismaMock.templateGalleryPage.findFirst).not.toHaveBeenCalled()
  })
})
