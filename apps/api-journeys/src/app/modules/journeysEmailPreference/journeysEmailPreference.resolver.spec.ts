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
        .spyOn(prismaService.journeysEmailPreference, 'findUnique')
        .mockResolvedValue(journeysEmailPreference)
      jest
        .spyOn(prismaService.journeysEmailPreference, 'update')
        .mockResolvedValue(updatedJourneysEmailPreference)

      const result = await resolver.updateJourneysEmailPreference(
        updatedJourneysEmailPreference
      )

      expect(result).toEqual(updatedJourneysEmailPreference)
      expect(
        prismaService.journeysEmailPreference.findUnique
      ).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      })
      expect(prismaService.journeysEmailPreference.update).toHaveBeenCalledWith(
        {
          where: { email: 'test@example.com' },
          data: updatedJourneysEmailPreference
        }
      )
    })
  })

  describe('findOrCreateJourneysEmailPreference', () => {
    it('should find an existing email preference', async () => {
      const email = journeysEmailPreference.email
      const existingJourneysEmailPreference = journeysEmailPreference
      jest
        .spyOn(prismaService.journeysEmailPreference, 'findUnique')
        .mockResolvedValue(existingJourneysEmailPreference)

      const result = await resolver.findOrCreateJourneysEmailPreference(email)

      expect(result).toEqual(existingJourneysEmailPreference)
      expect(
        prismaService.journeysEmailPreference.findUnique
      ).toHaveBeenCalledWith({
        where: { email }
      })
      expect(
        prismaService.journeysEmailPreference.create
      ).not.toHaveBeenCalled()
    })

    it('should create a new email preference if it does not exist', async () => {
      const newJourneysEmailPreference = journeysEmailPreference
      const email = journeysEmailPreference.email
      jest
        .spyOn(prismaService.journeysEmailPreference, 'findUnique')
        .mockResolvedValue(null)
      jest
        .spyOn(prismaService.journeysEmailPreference, 'create')
        .mockResolvedValue(newJourneysEmailPreference)

      const result = await resolver.findOrCreateJourneysEmailPreference(email)

      expect(result).toEqual(newJourneysEmailPreference)
      expect(
        prismaService.journeysEmailPreference.findUnique
      ).toHaveBeenCalledWith({
        where: { email }
      })
      expect(prismaService.journeysEmailPreference.create).toHaveBeenCalledWith(
        {
          data: {
            email,
            unsubscribeAll: false,
            accountNotifications: true
          }
        }
      )
    })
  })
})
