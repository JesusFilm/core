import { renderHook } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { changeJSDOMURL } from '../changeJSDOMURL'

import { useHandleNewAccountRedirect } from './useHandleNewAccountRedirect'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('HandleNewAccountRedirect', () => {
  const push = jest.fn()
  changeJSDOMURL('http://localhost:4200')

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return redirect if it exists', () => {
    mockUseRouter.mockReturnValue({
      push,
      pathname: '/users/sign-in',
      query: {
        redirect: 'http://localhost:4200/customparam'
      },
      asPath: '/users/sign-in'
    } as unknown as NextRouter)
    renderHook(() => useHandleNewAccountRedirect())

    expect(push).toHaveBeenCalledWith({
      pathname: '/users/sign-in',
      query: {
        redirect: 'http://localhost:4200/customparam?newAccount=true'
      }
    })
  })

  it('should append newAccount to url', () => {
    mockUseRouter.mockReturnValue({
      push,
      pathname: '/users/sign-in',
      query: {
        redirect: null
      },
      asPath: '/users/sign-in'
    } as unknown as NextRouter)
    renderHook(() => useHandleNewAccountRedirect())

    expect(push).toHaveBeenCalledWith({
      pathname: '/users/sign-in',
      query: {
        redirect: '?newAccount=true'
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
