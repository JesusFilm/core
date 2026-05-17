import { renderHook } from '@testing-library/react'
import { type NextRouter, useRouter } from 'next/router'

import {
  useTemplateDeepLinkActive,
  useTemplateDeepLinkJourneyId
} from './useTemplateDeepLinkActive'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

function mockRouterQuery(query: NextRouter['query']): void {
  mockUseRouter.mockReturnValue({ query } as unknown as NextRouter)
}

describe('useTemplateDeepLinkJourneyId', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns null when useTemplate is absent', () => {
    mockRouterQuery({})
    const { result } = renderHook(() => useTemplateDeepLinkJourneyId())
    expect(result.current).toBeNull()
  })

  it('returns null when useTemplate is an empty string', () => {
    mockRouterQuery({ useTemplate: '' })
    const { result } = renderHook(() => useTemplateDeepLinkJourneyId())
    expect(result.current).toBeNull()
  })

  it('returns the journey id when useTemplate is a non-empty string', () => {
    mockRouterQuery({ useTemplate: 'template-123' })
    const { result } = renderHook(() => useTemplateDeepLinkJourneyId())
    expect(result.current).toBe('template-123')
  })

  it('returns the first value when useTemplate is an array', () => {
    mockRouterQuery({ useTemplate: ['first-id', 'second-id'] })
    const { result } = renderHook(() => useTemplateDeepLinkJourneyId())
    expect(result.current).toBe('first-id')
  })

  it('returns null when useTemplate is an empty array', () => {
    mockRouterQuery({ useTemplate: [] })
    const { result } = renderHook(() => useTemplateDeepLinkJourneyId())
    expect(result.current).toBeNull()
  })
})

describe('useTemplateDeepLinkActive', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns false when useTemplate is absent', () => {
    mockRouterQuery({})
    const { result } = renderHook(() => useTemplateDeepLinkActive())
    expect(result.current).toBe(false)
  })

  it('returns false when useTemplate is an empty string', () => {
    mockRouterQuery({ useTemplate: '' })
    const { result } = renderHook(() => useTemplateDeepLinkActive())
    expect(result.current).toBe(false)
  })

  it('returns true when useTemplate is a non-empty string', () => {
    mockRouterQuery({ useTemplate: 'template-456' })
    const { result } = renderHook(() => useTemplateDeepLinkActive())
    expect(result.current).toBe(true)
  })

  it('returns true when useTemplate is an array with a value', () => {
    mockRouterQuery({ useTemplate: ['template-789'] })
    const { result } = renderHook(() => useTemplateDeepLinkActive())
    expect(result.current).toBe(true)
  })
})
