import { render } from '@testing-library/react'

// Import the component under test
import DownloadPage from './page'

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}))

describe('Audio Variant Download Page', () => {
  const mockVideoId = 'video-123'
  const mockVariantId = 'variant-456'

  // Mock router push function
  const mockRouterPush = jest.fn()

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock router.push
    jest
      .spyOn(require('next/navigation'), 'useRouter')
      .mockImplementation(() => ({
        push: mockRouterPush
      }))
  })

  it('should redirect to the variant page with correct path', () => {
    render(
      <DownloadPage
        params={{ videoId: mockVideoId, variantId: mockVariantId }}
      />
    )

    // Check if router.push was called with the correct path
    expect(mockRouterPush).toHaveBeenCalledWith(
      `/videos/${mockVideoId}/audio/${mockVariantId}`,
      { scroll: false }
    )
  })

  it('should render an empty fragment (no visible UI)', () => {
    const { container } = render(
      <DownloadPage
        params={{ videoId: mockVideoId, variantId: mockVariantId }}
      />
    )

    // Check that the component renders an empty fragment
    expect(container.firstChild).toBeNull()
  })
})
