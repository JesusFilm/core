import { Test } from '@nestjs/testing'

import { PrismaService } from '../../lib/prisma.service'

import { EmailPreferenceResolver } from './emailPreference.resolver'

describe('EmailPreferenceResolver', () => {
  let resolver: EmailPreferenceResolver
  let prismaService: PrismaService

  const emailPreference = {
    email: 'test@example.com',
    unsubscribeAll: false,
    teamInvite: true,
    teamRemoved: true,
    teamInviteAccepted: true,
    journeyEditInvite: true,
    journeyRequestApproved: true,
    journeyAccessRequest: true
  }

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        EmailPreferenceResolver,
        {
          provide: PrismaService,
          useValue: {
            emailPreference: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              create: jest.fn()
            }
          }
        }
      ]
    }).compile()

    resolver = moduleRef.get<EmailPreferenceResolver>(EmailPreferenceResolver)
    prismaService = moduleRef.get<PrismaService>(PrismaService)
  })

  describe('updateEmailPreference', () => {
    it('should update email preference', async () => {
      const updatedEmailPreference = { teaminvite: true, ...emailPreference }
      jest
        .spyOn(prismaService.emailPreference, 'findUnique')
        .mockResolvedValue(emailPreference)
      jest
        .spyOn(prismaService.emailPreference, 'update')
        .mockResolvedValue(updatedEmailPreference)

      const result = await resolver.updateEmailPreference(
        updatedEmailPreference
      )

      expect(result).toEqual(updatedEmailPreference)
      expect(prismaService.emailPreference.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      })
      expect(prismaService.emailPreference.update).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        data: updatedEmailPreference
      })
    })
  })

  describe('findOrCreateEmailPreference', () => {
    it('should find an existing email preference', async () => {
      const email = emailPreference.email
      const existingEmailPreference = emailPreference
      jest
        .spyOn(prismaService.emailPreference, 'findUnique')
        .mockResolvedValue(existingEmailPreference)

      const result = await resolver.findOrCreateEmailPreference(email)

      expect(result).toEqual(existingEmailPreference)
      expect(prismaService.emailPreference.findUnique).toHaveBeenCalledWith({
        where: { email }
      })
      expect(prismaService.emailPreference.create).not.toHaveBeenCalled()
    })

    it('should create a new email preference if it does not exist', async () => {
      const newEmailPreference = emailPreference
      const email = emailPreference.email
      jest
        .spyOn(prismaService.emailPreference, 'findUnique')
        .mockResolvedValue(null)
      jest
        .spyOn(prismaService.emailPreference, 'create')
        .mockResolvedValue(newEmailPreference)

      const result = await resolver.findOrCreateEmailPreference(email)

      expect(result).toEqual(newEmailPreference)
      expect(prismaService.emailPreference.findUnique).toHaveBeenCalledWith({
        where: { email }
      })
      expect(prismaService.emailPreference.create).toHaveBeenCalledWith({
        data: {
          email,
          unsubscribeAll: false,
          teamInvite: true,
          teamRemoved: true,
          teamInviteAccepted: true,
          journeyEditInvite: true,
          journeyRequestApproved: true,
          journeyAccessRequest: true
        }
      })
    })
  })
})
