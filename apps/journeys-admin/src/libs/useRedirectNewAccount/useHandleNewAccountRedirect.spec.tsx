import { renderHook } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { type MockedFunction } from 'vitest'

import { useHandleNewAccountRedirect } from './useHandleNewAccountRedirect'

vi.mock('next/router', () => ({
  __esModule: true,
  useRouter: vi.fn()
}))

const mockUseRouter = useRouter as MockedFunction<typeof useRouter>

describe('useHandleNewAccountRedirect', () => {
  const push = vi.fn()

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('does not push when redirectUrl is null', () => {
    mockUseRouter.mockReturnValue({
      push,
      pathname: '/users/sign-in',
      query: { redirect: null }
    } as unknown as NextRouter)

    renderHook(() => useHandleNewAccountRedirect())

    expect(push).not.toHaveBeenCalled()
  })

  it('does not push when redirectUrl does not contain /customize', () => {
    mockUseRouter.mockReturnValue({
      push,
      pathname: '/users/sign-in',
      query: { redirect: '/templates/journey-123' }
    } as unknown as NextRouter)

    renderHook(() => useHandleNewAccountRedirect())

    expect(push).not.toHaveBeenCalled()
  })

  it('does not push when redirectUrl already contains newAccount', () => {
    mockUseRouter.mockReturnValue({
      push,
      pathname: '/users/sign-in',
      query: {
        redirect:
          '/templates/journey-123/customize?screen=media&newAccount=true'
      }
    } as unknown as NextRouter)

    renderHook(() => useHandleNewAccountRedirect())

    expect(push).not.toHaveBeenCalled()
  })

  it('appends ?newAccount=true when redirectUrl contains /customize and has no query string', () => {
    mockUseRouter.mockReturnValue({
      push,
      pathname: '/users/sign-in',
      query: { redirect: '/templates/journey-123/customize' }
    } as unknown as NextRouter)

    renderHook(() => useHandleNewAccountRedirect())

    expect(push).toHaveBeenCalledWith({
      pathname: '/users/sign-in',
      query: { redirect: '/templates/journey-123/customize?newAccount=true' }
    })
  })

  it('appends &newAccount=true when redirectUrl contains /customize and already has query params', () => {
    mockUseRouter.mockReturnValue({
      push,
      pathname: '/users/sign-in',
      query: { redirect: '/templates/journey-123/customize?screen=media' }
    } as unknown as NextRouter)

    renderHook(() => useHandleNewAccountRedirect())

    expect(push).toHaveBeenCalledWith({
      pathname: '/users/sign-in',
      query: {
        redirect:
          '/templates/journey-123/customize?screen=media&newAccount=true'
      }
    })
  })
})
