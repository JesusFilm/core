import { renderHook } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { useHandleNewAccountRedirect } from './useHandleNewAccountRedirect'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

Object.defineProperty(window, 'location', {
  configurable: true,
  enumerable: true,
  value: { origin: 'http://localhost:4200' }
})

describe('HandleNewAccountRedirect', () => {
  const push = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should append newAccount to redirect', () => {
    mockUseRouter.mockReturnValue({
      push,
      pathname: '/users/sign-in',
      query: {
        redirect: 'http://localhost:4200/'
      },
      asPath: '/users/sign-in'
    } as unknown as NextRouter)
    renderHook(() => useHandleNewAccountRedirect())

    expect(push).toHaveBeenCalledWith({
      pathname: '/users/sign-in',
      query: {
        redirect: 'http://localhost:4200?newAccount=true'
      }
    })
  })

  it('should append newAccount at the end of redirect if createNew exists', () => {
    mockUseRouter.mockReturnValue({
      push,
      pathname: '/users/sign-in',
      query: {
        redirect: 'http://localhost:4200?createNew=true'
      },
      asPath: '/users/sign-in'
    } as unknown as NextRouter)
    renderHook(() => useHandleNewAccountRedirect())

    expect(push).toHaveBeenCalledWith({
      pathname: '/users/sign-in',
      query: {
        redirect: 'http://localhost:4200?createNew=true&newAccount=true'
      }
    })
  })
})
