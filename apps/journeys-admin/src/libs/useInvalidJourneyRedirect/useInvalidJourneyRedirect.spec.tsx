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
  it('should redirect to homepage if journey is invalid', () => {
    renderHook(() => useInvalidJourneyRedirect({ journey: null }))

    expect(push).toHaveBeenCalledWith('/')
  })

  it('should redirect if the the journeyId is invalid in the templates URL', async () => {
    // do something
  })
})

// it('should redirect if the the journeyId is invalid in the publisher URL', async () => {
//   // do something
// })
