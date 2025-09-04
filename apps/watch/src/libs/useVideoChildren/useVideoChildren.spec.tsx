import { MockedProvider } from '@apollo/client/testing'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'

import { videos } from '../../components/Videos/__generated__/testData'

import { GET_VIDEO_CHILDREN , useVideoChildren } from './useVideoChildren'

const mockData = {
  video: {
    id: '1_jf-0-0',
    children: videos
  }
}

const mockDataWithNullVariants = {
  video: {
    id: '1_jf-0-0',
    children: [
      {
        ...videos[0],
        variant: null
      },
      {
        ...videos[1],
        variant: {
          ...videos[1].variant,
          id: '2_529-jf-0-1'
        }
      }
    ]
  }
}

const mockDataWithEmptyChildren = {
  video: {
    id: '1_jf-0-0',
    children: []
  }
}

const mockDataWithNullChildren = {
  video: {
    id: '1_jf-0-0',
    children: null
  }
}

const mockDataWithUndefinedVideo = {
  video: null
}

const mockDataWithMixedVariants = {
  video: {
    id: '1_jf-0-0',
    children: [
      { ...videos[0], variant: null },
      { ...videos[1], variant: videos[1].variant },
      { ...videos[2], variant: null },
      { ...videos[3], variant: videos[3].variant }
    ]
  }
}

const wrapper = ({
  children,
  mocks
}: {
  children: ReactNode
  mocks: any[]
}) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    {children}
  </MockedProvider>
)

describe('useVideoChildren', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return loading state initially', () => {
    const mocks = [
      {
        request: {
          query: GET_VIDEO_CHILDREN,
          variables: { id: 'test-slug', languageId: '529' }
        },
        result: {
          data: mockData
        }
      }
    ]

    const { result } = renderHook(() => useVideoChildren('test-slug', 'en'), {
      wrapper: ({ children }) => wrapper({ children, mocks })
    })

    expect(result.current.loading).toBe(true)
    expect(result.current.children).toEqual([])
  })

  it('should return children with variants when data is loaded', async () => {
    const mocks = [
      {
        request: {
          query: GET_VIDEO_CHILDREN,
          variables: { id: 'test-slug', languageId: '529' }
        },
        result: {
          data: mockData
        }
      }
    ]

    const { result } = renderHook(() => useVideoChildren('test-slug', 'en'), {
      wrapper: ({ children }) => wrapper({ children, mocks })
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.children).toHaveLength(videos.length)
    expect(result.current.children[0]).toEqual(videos[0])
  })

  it('should filter out children without variants', async () => {
    const mocks = [
      {
        request: {
          query: GET_VIDEO_CHILDREN,
          variables: { id: 'test-slug', languageId: '529' }
        },
        result: {
          data: mockDataWithNullVariants
        }
      }
    ]

    const { result } = renderHook(() => useVideoChildren('test-slug', 'en'), {
      wrapper: ({ children }) => wrapper({ children, mocks })
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Should only return children with variants
    expect(result.current.children).toHaveLength(1)
    expect(result.current.children[0].variant).toBeDefined()
  })

  it('should return empty array when children is null', async () => {
    const mocks = [
      {
        request: {
          query: GET_VIDEO_CHILDREN,
          variables: { id: 'test-slug', languageId: '529' }
        },
        result: {
          data: mockDataWithNullChildren
        }
      }
    ]

    const { result } = renderHook(() => useVideoChildren('test-slug', 'en'), {
      wrapper: ({ children }) => wrapper({ children, mocks })
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.children).toEqual([])
  })

  it('should return empty array when children is empty array', async () => {
    const mocks = [
      {
        request: {
          query: GET_VIDEO_CHILDREN,
          variables: { id: 'test-slug', languageId: '529' }
        },
        result: {
          data: mockDataWithEmptyChildren
        }
      }
    ]

    const { result } = renderHook(() => useVideoChildren('test-slug', 'en'), {
      wrapper: ({ children }) => wrapper({ children, mocks })
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.children).toEqual([])
  })

  it('should return empty array when video is null', async () => {
    const mocks = [
      {
        request: {
          query: GET_VIDEO_CHILDREN,
          variables: { id: 'test-slug', languageId: '529' }
        },
        result: {
          data: mockDataWithUndefinedVideo
        }
      }
    ]

    const { result } = renderHook(() => useVideoChildren('test-slug', 'en'), {
      wrapper: ({ children }) => wrapper({ children, mocks })
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.children).toEqual([])
  })

  it('should skip query when slug is undefined', () => {
    const mocks: any[] = []

    const { result } = renderHook(() => useVideoChildren(undefined, 'en'), {
      wrapper: ({ children }) => wrapper({ children, mocks })
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.children).toEqual([])
  })

  it('should pass correct languageId for different locales', async () => {
    const mocks = [
      {
        request: {
          query: GET_VIDEO_CHILDREN,
          variables: { id: 'test-slug', languageId: '21028' }
        },
        result: {
          data: mockData
        }
      }
    ]

    const { result } = renderHook(() => useVideoChildren('test-slug', 'es'), {
      wrapper: ({ children }) => wrapper({ children, mocks })
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.children).toHaveLength(videos.length)
  })

  it('should handle error state gracefully', async () => {
    const mocks = [
      {
        request: {
          query: GET_VIDEO_CHILDREN,
          variables: { id: 'test-slug', languageId: '529' }
        },
        error: new Error('Network error')
      }
    ]

    const { result } = renderHook(() => useVideoChildren('test-slug', 'en'), {
      wrapper: ({ children }) => wrapper({ children, mocks })
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.children).toEqual([])
  })

  it('should handle multiple children with mixed variant states', async () => {
    const mocks = [
      {
        request: {
          query: GET_VIDEO_CHILDREN,
          variables: { id: 'test-slug', languageId: '529' }
        },
        result: {
          data: mockDataWithMixedVariants
        }
      }
    ]

    const { result } = renderHook(() => useVideoChildren('test-slug', 'en'), {
      wrapper: ({ children }) => wrapper({ children, mocks })
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Should only return children with variants
    expect(result.current.children).toHaveLength(2)
    expect(result.current.children[0].variant).toBeDefined()
    expect(result.current.children[1].variant).toBeDefined()
  })

  it('should use default languageId when locale is undefined', async () => {
    const mocks = [
      {
        request: {
          query: GET_VIDEO_CHILDREN,
          variables: { id: 'test-slug', languageId: '529' }
        },
        result: {
          data: mockData
        }
      }
    ]

    const { result } = renderHook(
      () => useVideoChildren('test-slug', undefined),
      {
        wrapper: ({ children }) => wrapper({ children, mocks })
      }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.children).toHaveLength(videos.length)
  })
})
