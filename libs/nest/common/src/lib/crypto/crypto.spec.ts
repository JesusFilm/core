import { Integration } from '@core/prisma/journeys/client'

import { decryptSymmetric, encryptSymmetric } from './crypto'

describe('crypto', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    process.env = { ...OLD_ENV }
  })

  afterEach(() => {
    jest.clearAllMocks()
    process.env = OLD_ENV
  })

  const integration: Integration = {
    id: 'integrationId',
    teamId: 'teamId',
    type: 'growthSpaces',
    accessId: 'accessId',
    // decrypted value for accessSecretCipherText should be "plaintext"
    accessSecretPart: 'plaint',
    accessSecretCipherText: 'saeRCBy44pMT',
    accessSecretIv: 'dx+2iBr7yYvilLIC',
    accessSecretTag: 'VondZ4B9TbgdwCQeqjnkfA=='
  }

  describe('encryptSymmetric', () => {
    it('should encrypt plaintext', async () => {
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        'dontbefooledbythiskryptokeyitisactuallyfake='

      const plainTextToBeEncrypted = 'plaintext'

      const res = await encryptSymmetric(
        plainTextToBeEncrypted,
        process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET
      )

      expect(res.ciphertext).not.toEqual(plainTextToBeEncrypted)
      expect(res.iv).toEqual(expect.any(String))
      expect(res.tag).toEqual(expect.any(String))
    })

    it('should throw error if there is no encryption key', async () => {
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET = undefined

      const plainTextToBeEncrypted = 'plaintext'

      await expect(
        encryptSymmetric(
          plainTextToBeEncrypted,
          process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET
        )
      ).rejects.toThrow('no crypto key')
    })
  })

  describe('decryptSymmetric', () => {
    it('should decrypt an encrypted key', async () => {
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        'dontbefooledbythiskryptokeyitisactuallyfake='

      const res = await decryptSymmetric(
        integration.accessSecretCipherText as string,
        integration.accessSecretIv as string,
        integration.accessSecretTag as string,
        process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET
      )

      expect(res).toBe('plaintext')
    })

    it('should throw error if no encryption keys', async () => {
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET = undefined

      await expect(
        decryptSymmetric(
          integration.accessSecretCipherText as string,
          integration.accessSecretIv as string,
          integration.accessSecretTag as string,
          process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET
        )
      ).rejects.toThrow('no crypto key')
    })
  })
})
