import { getFirebasePrivateKey } from '.'

describe('getFirebasePrivateKey', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules() // Most important - it clears the cache
    process.env = { ...OLD_ENV } // Make a copy
    process.env.PRIVATE_FIREBASE_PRIVATE_KEY_ENC_IV =
      '305816f0972803b4d660f4f26e0141f2'
    process.env.PRIVATE_FIREBASE_PRIVATE_KEY_ENC_KEY =
      'c439423861999479e3c6852f211e4178'
    process.env.DOPPLER_ENVIRONMENT = 'test'
  })

  afterAll(() => {
    process.env = OLD_ENV // Restore old environment
  })

  it('decrypts test encryption message', () => {
    expect(getFirebasePrivateKey()).toBe('hello world')
  })

  describe('PRIVATE_FIREBASE_PRIVATE_KEY_ENC_IV missing', () => {
    beforeEach(() => {
      process.env.PRIVATE_FIREBASE_PRIVATE_KEY_ENC_IV = undefined
    })

    it('returns empty string', () => {
      expect(getFirebasePrivateKey()).toBe('')
    })
  })

  describe('PRIVATE_FIREBASE_PRIVATE_KEY_ENC_IV invalid', () => {
    beforeEach(() => {
      process.env.PRIVATE_FIREBASE_PRIVATE_KEY_ENC_IV =
        'fe42e5d1d6056f7720670d2795089c72'
    })

    it('throws error', () => {
      expect(() => getFirebasePrivateKey()).toThrow()
    })
  })

  describe('PRIVATE_FIREBASE_PRIVATE_KEY_ENC_KEY missing', () => {
    beforeEach(() => {
      process.env.PRIVATE_FIREBASE_PRIVATE_KEY_ENC_KEY = undefined
    })

    it('returns empty string', () => {
      expect(getFirebasePrivateKey()).toBe('')
    })
  })

  describe('PRIVATE_FIREBASE_PRIVATE_KEY_ENC_KEY invalid', () => {
    beforeEach(() => {
      process.env.PRIVATE_FIREBASE_PRIVATE_KEY_ENC_KEY =
        'b004a27ca5d229548755db2d199d57db'
    })

    it('throws error', () => {
      expect(() => getFirebasePrivateKey()).toThrow()
    })
  })

  describe('DOPPLER_ENVIRONMENT missing', () => {
    beforeEach(() => {
      process.env.DOPPLER_ENVIRONMENT = undefined
    })

    it('returns empty string', () => {
      expect(getFirebasePrivateKey()).toBe('')
    })
  })

  describe('DOPPLER_ENVIRONMENT other environment', () => {
    beforeEach(() => {
      process.env.DOPPLER_ENVIRONMENT = 'abc'
    })

    it('returns empty string', () => {
      expect(getFirebasePrivateKey()).toBe('')
    })
  })
})
