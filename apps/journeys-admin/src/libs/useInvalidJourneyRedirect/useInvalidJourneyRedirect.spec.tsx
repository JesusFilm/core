import { renderHook } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { type MockedFunction } from 'vitest'

import { useInvalidJourneyRedirect } from './useInvalidJourneyRedirect'

vi.mock('next/router', () => ({
  __esModule: true,
  useRouter: vi.fn()
}))

const mockUseRouter = useRouter as MockedFunction<typeof useRouter>

describe('InvalidJourneyRedirect', () => {
  const push = vi.fn()
  mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should redirect to homepage if journey is invalid in the journeys URL', async () => {
    renderHook(() => useInvalidJourneyRedirect({ journey: null }))

    expect(push).toHaveBeenCalledWith('/')
  })

  it('should not be redirected to homepage if journey is vaild in the journeys URL', async () => {
    renderHook(() => useInvalidJourneyRedirect({ journey: 'journeyID' }))

    expect(push).not.toHaveBeenCalled()
  })

  it('should redirect if the the journeyId is invalid in the templates URL', async () => {
    renderHook(() => useInvalidJourneyRedirect({ template: null }))

    expect(push).toHaveBeenCalledWith('/')
  })

  it('should not be redirected to homepage if journey is vaild in the templates URL', async () => {
    renderHook(() => useInvalidJourneyRedirect({ template: 'templateID' }))

    expect(push).not.toHaveBeenCalled()
  })

  it('should redirect if the the journeyId is invalid in the publisher URL', async () => {
    renderHook(() => useInvalidJourneyRedirect({ publisherTemplate: null }))

    expect(push).toHaveBeenCalledWith('/')
  })

  it('should not be redirected to homepage if journey is vaild in the publisher URL', async () => {
    renderHook(() =>
      useInvalidJourneyRedirect({ publisherTemplate: 'publisherTemplateID' })
    )

    expect(push).not.toHaveBeenCalled()
  })
})
