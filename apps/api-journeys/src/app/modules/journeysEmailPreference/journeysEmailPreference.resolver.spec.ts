import { Test } from '@nestjs/testing'

import { PrismaService } from '../../lib/prisma.service'

import { JourneysEmailPreferenceResolver } from './journeysEmailPreference.resolver'

describe('JourneysEmailPreferenceResolver', () => {
  let resolver: JourneysEmailPreferenceResolver
  let prismaService: PrismaService

  const journeysEmailPreference = {
    email: 'test@example.com',
    unsubscribeAll: false,
    accountNotifications: true
  }

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        JourneysEmailPreferenceResolver,
        {
          provide: PrismaService,
          useValue: {
            journeysEmailPreference: {
              findUnique: jest.fn(),
              upsert: jest.fn()
            }
          }
        }
      ]
    }).compile()

    resolver = moduleRef.get<JourneysEmailPreferenceResolver>(
      JourneysEmailPreferenceResolver
    )
    prismaService = moduleRef.get<PrismaService>(PrismaService)
  })

  describe('updateJourneysEmailPreference', () => {
    it('should update email preference', async () => {
      const updatedJourneysEmailPreference = {
        teaminvite: true,
        ...journeysEmailPreference
      }
      jest
        .spyOn(prismaService.journeysEmailPreference, 'upsert')
        .mockResolvedValue(updatedJourneysEmailPreference)

      const result = await resolver.updateJourneysEmailPreference({
        email: journeysEmailPreference.email,
        preference: 'unsubscribeAll',
        value: true
      })

      expect(result).toEqual(updatedJourneysEmailPreference)
      expect(prismaService.journeysEmailPreference.upsert).toHaveBeenCalledWith(
        {
          where: { email: journeysEmailPreference.email },
          create: {
            email: journeysEmailPreference.email,
            unsubscribeAll: true
          },
          update: {
            unsubscribeAll: true
          }
        }
      )
    })
  })

  describe('journeysEmailPreference', () => {
    it('should find an existing email preference', async () => {
      const email = journeysEmailPreference.email
      const existingJourneysEmailPreference = journeysEmailPreference
      jest
        .spyOn(prismaService.journeysEmailPreference, 'findUnique')
        .mockResolvedValue(existingJourneysEmailPreference)

      const result = await resolver.journeysEmailPreference(email)

      expect(result).toEqual(existingJourneysEmailPreference)
      expect(
        prismaService.journeysEmailPreference.findUnique
      ).toHaveBeenCalledWith({
        where: { email }
      })
    })
  })
})
