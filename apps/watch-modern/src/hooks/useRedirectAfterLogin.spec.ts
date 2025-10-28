import { act, renderHook } from '@testing-library/react'

import { useRedirectAfterLogin } from './useRedirectAfterLogin'

const mockReplace = jest.fn().mockResolvedValue(true)

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    query: {},
    replace: mockReplace
  }))
}))

describe('useRedirectAfterLogin', () => {
  beforeEach(() => {
    mockReplace.mockClear()
  })

  it('defaults to /studio/new when no redirect query is present', async () => {
    const { result } = renderHook(() => useRedirectAfterLogin())

    await act(async () => {
      await result.current()
    })

    expect(mockReplace).toHaveBeenCalledWith('/studio/new')
  })

  it('uses a safe redirect when provided', async () => {
    const useRouter = jest.requireMock('next/router').useRouter as jest.Mock
    useRouter.mockReturnValueOnce({
      query: {
        redirect: encodeURIComponent('http://localhost/studio/custom')
      },
      replace: mockReplace
    })

    const { result } = renderHook(() => useRedirectAfterLogin())

    await act(async () => {
      await result.current()
    })

    expect(mockReplace).toHaveBeenCalledWith('http://localhost/studio/custom')
  })

  it('falls back to the fallback URL for unsafe redirects', async () => {
    const useRouter = jest.requireMock('next/router').useRouter as jest.Mock
    useRouter.mockReturnValueOnce({
      query: {
        redirect: encodeURIComponent('https://malicious.example.com')
      },
      replace: mockReplace
    })

    const { result } = renderHook(() => useRedirectAfterLogin())

    await act(async () => {
      await result.current('/studio/new')
    })

    expect(mockReplace).toHaveBeenCalledWith('/studio/new')
  })
})
