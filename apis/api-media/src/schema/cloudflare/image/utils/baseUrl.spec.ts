import clone from 'lodash/clone'

import { baseUrl } from './baseUrl'

describe('baseUrl', () => {
  const originalEnv = clone(process.env)

  beforeEach(() => {
    process.env = originalEnv
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('returns URL with custom account ID when CLOUDFLARE_IMAGE_ACCOUNT is set', () => {
    process.env.CLOUDFLARE_IMAGE_ACCOUNT = 'customAccount'
    expect(baseUrl('test-image-id')).toBe(
      'https://imagedelivery.net/customAccount/test-image-id'
    )
  })

  it('returns URL with default account ID when CLOUDFLARE_IMAGE_ACCOUNT is not set', () => {
    delete process.env.CLOUDFLARE_IMAGE_ACCOUNT
    expect(baseUrl('test-image-id')).toBe(
      'https://imagedelivery.net/testAccount/test-image-id'
    )
  })

  it('handles different image IDs correctly', () => {
    process.env.CLOUDFLARE_IMAGE_ACCOUNT = 'testAccount'
    expect(baseUrl('image-123')).toBe(
      'https://imagedelivery.net/testAccount/image-123'
    )
    expect(baseUrl('another-image-456')).toBe(
      'https://imagedelivery.net/testAccount/another-image-456'
    )
  })
})
