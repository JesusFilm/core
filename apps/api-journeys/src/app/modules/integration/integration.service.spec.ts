import { Test } from '@nestjs/testing'
import { IntegrationService } from './integration.service'
import { Integration } from '.prisma/api-journeys-client'

describe('IntegrationService', () => {
  const OLD_ENV = process.env

  let service: IntegrationService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [IntegrationService]
    }).compile()

    service = await module.get<IntegrationService>(IntegrationService)

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
    accessSecretCipherText: 'saeRCBy44pMT',
    accessSecretIv: 'dx+2iBr7yYvilLIC',
    accessSecretTag: 'VondZ4B9TbgdwCQeqjnkfA=='
  }
  describe('encryptSymmetric', () => {
    it('should encrypt plaintext', async () => {
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        'dontbefooledbythiskryptokeyitisactuallyfake='

      const plainTextToBeEncrypted = 'plaintext'

      const res = await service.encryptSymmetric(
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
        service.encryptSymmetric(
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

      const res = await service.decryptSymmetric(
        integration.accessSecretCipherText as string,
        integration.accessSecretIv as string,
        integration.accessSecretTag as string,
        process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET
      )

      expect(res).toEqual('plaintext')
    })

    it('should throw error if no encryption keys', async () => {
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET = undefined

      await expect(
        service.decryptSymmetric(
          integration.accessSecretCipherText as string,
          integration.accessSecretIv as string,
          integration.accessSecretTag as string,
          process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET
        )
      ).rejects.toThrow('no crypto key')
    })
  })
})
