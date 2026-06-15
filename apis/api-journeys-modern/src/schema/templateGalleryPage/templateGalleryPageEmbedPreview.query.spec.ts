import { GraphQLError } from 'graphql'
import { type MockedFunction, vi } from 'vitest'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { graphql } from '../../lib/graphql/subgraphGraphql'

import { linkValidate } from './media/linkValidate'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))
vi.mock('./media/linkValidate', () => ({ linkValidate: vi.fn() }))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>
const mockLinkValidate = linkValidate as MockedFunction<typeof linkValidate>

const EMBED_PREVIEW = graphql(`
  query TemplateGalleryPageEmbedPreview($url: String!) {
    templateGalleryPageEmbedPreview(url: $url)
  }
`)

describe('templateGalleryPageEmbedPreview', () => {
  const mockUser = {
    id: 'userId',
    email: 'test@example.com',
    emailVerified: true,
    firstName: 'Test',
    lastName: 'User',
    imageUrl: null,
    roles: []
  }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })
  const publicClient = getClient()

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
  })

  it('returns the normalized embedUrl for an authenticated caller', async () => {
    mockLinkValidate.mockResolvedValue({
      embedUrl: 'https://www.youtube-nocookie.com/embed/abc'
    })

    const result = (await authClient({
      document: EMBED_PREVIEW,
      variables: { url: 'https://www.youtube.com/watch?v=abc' }
    })) as any

    expect(result.errors).toBeUndefined()
    expect(result.data.templateGalleryPageEmbedPreview).toBe(
      'https://www.youtube-nocookie.com/embed/abc'
    )
    expect(mockLinkValidate).toHaveBeenCalledWith(
      'https://www.youtube.com/watch?v=abc'
    )
  })

  it('propagates the linkValidate reason code unchanged (preview === save errors)', async () => {
    mockLinkValidate.mockRejectedValue(
      new GraphQLError('This host is not allowed to be embedded.', {
        extensions: { code: 'BAD_USER_INPUT', reason: 'EMBED_HOST_NOT_ALLOWED' }
      })
    )

    const result = (await authClient({
      document: EMBED_PREVIEW,
      variables: { url: 'https://evil.example.com/x' }
    })) as any

    expect(result.errors?.[0]?.extensions?.reason).toBe(
      'EMBED_HOST_NOT_ALLOWED'
    )
  })

  it('rejects unauthenticated callers without running any fetch', async () => {
    mockGetUserFromPayload.mockReturnValue(null)

    const result = (await publicClient({
      document: EMBED_PREVIEW,
      variables: { url: 'https://www.youtube.com/watch?v=abc' }
    })) as any

    expect(result.errors).toBeDefined()
    // linkValidate (and therefore any server-side fetch) must never run for an
    // unauthenticated caller — the auth gate is the SSRF/anonymous-surface bound.
    expect(mockLinkValidate).not.toHaveBeenCalled()
  })
})
