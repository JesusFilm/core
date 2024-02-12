import { Test } from '@nestjs/testing'

import { EmailPreferencesUpdateInput } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

import { EmailPreferencesResolver } from './emailPreferences.resolver'

describe('EmailPreferencesResolver', () => {
  let resolver: EmailPreferencesResolver
  let prismaService: PrismaService

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        EmailPreferencesResolver,
        {
          provide: PrismaService,
          useValue: {
            // Mock the PrismaService methods used in the resolver
            emailPreferences: jest.fn(),
            emailPreference: jest.fn(),
            updateEmailPreferences: jest.fn(),
            findOrCreateEmailPreference: jest.fn(),
            createEmailPreferencesForAllUsers: jest.fn()
          }
        }
      ]
    }).compile()

    resolver = moduleRef.get<EmailPreferencesResolver>(EmailPreferencesResolver)
    prismaService = moduleRef.get<PrismaService>(PrismaService)
  })

  describe('emailPreferences', () => {
    it('should return an array of email preferences', async () => {
      const emailPreferences = [{ id: '1', email: 'test@example.com' }]
      jest
        .spyOn(prismaService, 'emailPreference' as never)
        .mockResolvedValue(emailPreferences as never)

      const result = await resolver.emailPreferences()

      expect(result).toEqual(emailPreferences)
      expect(prismaService.emailPreferences).toHaveBeenCalled()
    })
  })

  describe('emailPreference', () => {
    it('should return a single email preference', async () => {
      const emailPreference = { id: '1', email: 'test@example.com' }
      jest
        .spyOn(prismaService, 'emailPreferences' as never)
        .mockResolvedValue(emailPreference as never)

      const result = await resolver.emailPreference('1', 'id')

      expect(result).toEqual(emailPreference)
      expect(prismaService.emailPreferences).toHaveBeenCalledWith('1', 'id')
    })
  })

  describe('updateEmailPreferences', () => {
    it('should update email preferences', async () => {
      const input: EmailPreferencesUpdateInput = {
        id: '1',
        journeyNotifications: true,
        teamInvites: true,
        thirdCategory: true
      }
      const updatedEmailPreference = { id: '1', email: 'updated@example.com' }
      jest
        .spyOn(prismaService, 'emailPreferences' as never)
        .mockResolvedValue(updatedEmailPreference as never)

      const result = await resolver.updateEmailPreferences(input)

      expect(result).toEqual(updatedEmailPreference)
      expect(prismaService.emailPreferences).toHaveBeenCalledWith(input)
    })
  })

  describe('findOrCreateEmailPreference', () => {
    it('should find or create an email preference', async () => {
      const email = 'test@example.com'
      const emailPreference = { id: '1', email: 'test@example.com' }
      jest
        .spyOn(prismaService, 'findOrCreateEmailPreferences' as never)
        .mockResolvedValue(emailPreference as never)

      const result = await resolver.findOrCreateEmailPreference(email)

      expect(result).toEqual(emailPreference)
      expect(resolver.findOrCreateEmailPreference).toHaveBeenCalledWith(email)
    })
  })

  describe('createEmailPreferencesForAllUsers', () => {
    it('should create email preferences for all users', async () => {
      const result = await resolver.createEmailPreferencesForAllUsers()

      expect(result).toBe(true)
      expect(resolver.createEmailPreferencesForAllUsers).toHaveBeenCalled()
    })
  })
})
