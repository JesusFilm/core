import jwt from 'jsonwebtoken'

import { isTokenExpired } from './apolloClient'

jest.mock('jsonwebtoken')

describe('isTokenExpired', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns true if the token is expired', () => {
    const mockToken = 'mock-token'
    const mockDecodedToken = { exp: Math.floor(Date.now() / 1000) - 1 }
    jest.spyOn(jwt, 'decode').mockReturnValue(mockDecodedToken)
    expect(isTokenExpired(mockToken)).toBe(true)
    expect(jwt.decode).toHaveBeenCalledWith(mockToken)
  })

  it('returns false if the token is not expired', () => {
    const mockToken = 'mock-token'
    const mockDecodedToken = { exp: Math.floor(Date.now() / 1000) + 10 }
    jest.spyOn(jwt, 'decode').mockReturnValue(mockDecodedToken)
    expect(isTokenExpired(mockToken)).toBe(false)
    expect(jwt.decode).toHaveBeenCalledWith(mockToken)
  })

  it('returns true if there is an error decoding the token', () => {
    const mockToken = 'mock-token'
    jest.spyOn(jwt, 'decode').mockImplementation(() => {
      throw new Error('Invalid token')
    })
    expect(isTokenExpired(mockToken)).toBe(true)
    expect(jwt.decode).toHaveBeenCalledWith(mockToken)
  })
})
