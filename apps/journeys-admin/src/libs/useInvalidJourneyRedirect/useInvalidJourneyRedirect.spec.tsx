import { renderHook } from '@testing-library/react-hooks'
import { NextRouter, useRouter } from 'next/router'

import { useInvalidJourneyRedirect } from './useInvalidJourneyRedirect'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('InvalidJourneyRedirect', () => {
  const push = jest.fn()
  mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)

  afterEach(() => {
    jest.clearAllMocks()
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
