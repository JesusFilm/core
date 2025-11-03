import clone from 'lodash/clone'

import { getInteropContext } from '.'

describe('interop', () => {
  const originalEnv = clone(process.env)

  beforeEach(async () => {
    process.env = originalEnv
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('getInteropContext', () => {
    it('should return interopContext when interopToken is correct and ipAddress is valid', () => {
      process.env.INTEROP_TOKEN = 'correct-token'
      process.env.NAT_ADDRESSES = '1.1.1.1'
      expect(
        getInteropContext({
          interopToken: 'correct-token',
          ipAddress: '1.1.1.1, 10.11.10.220'
        })
      ).toEqual({
        interopToken: 'correct-token',
        ipAddress: '1.1.1.1'
      })
    })

    it('should return null when interopToken is incorrect', () => {
      process.env.INTEROP_TOKEN = 'correct-token'
      expect(
        getInteropContext({
          interopToken: 'incorrect-token',
          ipAddress: '1.1.1.1'
        })
      ).toBeNull()
    })

    it('should return null when interopToken is null', () => {
      process.env.INTEROP_TOKEN = 'correct-token'
      process.env.NAT_ADDRESSES = '1.1.1.1'
      expect(
        getInteropContext({
          interopToken: null,
          ipAddress: '1.1.1.1'
        })
      ).toBeNull()
    })

    it('should return null when ipAddress is not a nat address', () => {
      process.env.INTEROP_TOKEN = 'correct-token'
      process.env.NAT_ADDRESSES = '1.1.1.1'
      expect(
        getInteropContext({
          interopToken: 'correct-token',
          ipAddress: '8.8.8.8'
        })
      ).toBeNull()
    })

    it('should return null when ipAddress is an array of addresses but does not match', () => {
      process.env.INTEROP_TOKEN = 'correct-token'
      process.env.NAT_ADDRESSES = '1.1.1.1'
      expect(
        getInteropContext({
          interopToken: 'correct-token',
          ipAddress: '172.183.37.94, 10.11.10.220'
        })
      ).toBeNull()
    })

    it('should throw error when ipAddress is invalid', () => {
      process.env.INTEROP_TOKEN = 'correct-token'
      process.env.NAT_ADDRESSES = '1.1.1.1'
      expect(() =>
        getInteropContext({
          interopToken: 'correct-token',
          ipAddress: 'invalid_ip_address'
        })
      ).toThrow('Invalid IP address (invalid_ip_address)')
    })

    it('should return null when NAT_ADDRESSES is not set', () => {
      process.env.INTEROP_TOKEN = 'correct-token'
      expect(
        getInteropContext({
          interopToken: 'correct-token',
          ipAddress: '8.8.8.8'
        })
      ).toBeNull()
    })

    it('should return null when ipAddress is null and NAT_ADDRESSES does not include loopback address', () => {
      process.env.INTEROP_TOKEN = 'correct-token'
      process.env.NAT_ADDRESSES = '1.1.1.1'
      expect(
        getInteropContext({
          interopToken: 'correct-token',
          ipAddress: null
        })
      ).toBeNull()
    })

    it('should return null when ipAddress is blank and NAT_ADDRESSES does not include loopback address', () => {
      process.env.INTEROP_TOKEN = 'correct-token'
      process.env.NAT_ADDRESSES = '1.1.1.1'
      expect(
        getInteropContext({
          interopToken: 'correct-token',
          ipAddress: ''
        })
      ).toBeNull()
    })

    it('should return interopContext when ipAddress is blank and NAT_ADDRESSES includes loopback address', () => {
      process.env.INTEROP_TOKEN = 'correct-token'
      process.env.NAT_ADDRESSES = '1.1.1.1,127.0.0.1'
      expect(
        getInteropContext({
          interopToken: 'correct-token',
          ipAddress: ''
        })
      ).toEqual({
        interopToken: 'correct-token',
        ipAddress: '127.0.0.1'
      })
    })

    it('should return interopContext when ipAddress is null and NAT_ADDRESSES includes loopback address', () => {
      process.env.INTEROP_TOKEN = 'correct-token'
      process.env.NAT_ADDRESSES = '1.1.1.1,127.0.0.1'
      expect(
        getInteropContext({
          interopToken: 'correct-token',
          ipAddress: null
        })
      ).toEqual({
        interopToken: 'correct-token',
        ipAddress: '127.0.0.1'
      })
    })
  })
})
