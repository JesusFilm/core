import { Job } from 'bullmq'

import { User } from '@core/nest/common/firebaseClient'
import { JourneyProfile } from '@core/prisma/journeys/client'

import { prismaMock } from '../../../../test/prismaMock'

import { mailChimpSyncUser } from './mailChimpSyncUser'
import { service } from './service'

jest.mock('./mailChimpSyncUser', () => ({
  mailChimpSyncUser: jest.fn()
}))

const mockMailChimpSyncUser = mailChimpSyncUser as jest.MockedFunction<
  typeof mailChimpSyncUser
>

describe('ProfileCreateService', () => {
  const mockUser: User = {
    id: 'userId',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    emailVerified: true
  }

  const mockCreatedProfile: JourneyProfile = {
    id: 'profileId',
    userId: 'userId',
    acceptedTermsAt: new Date('2021-02-18T00:00:00.000Z'),
    lastActiveTeamId: null,
    journeyFlowBackButtonClicked: null,
    plausibleJourneyFlowViewed: null,
    plausibleDashboardViewed: null
  }

  const mockJourney = {
    id: 'journeyId1',
    guestJourney: true,
    status: 'published' as any,
    updatedAt: new Date(),
    title: 'Test Journey',
    languageId: '529',
    description: null,
    slug: 'test-journey',
    archivedAt: null,
    createdAt: new Date(),
    deletedAt: null,
    trashedAt: null,
    featuredAt: null,
    seoTitle: null,
    seoDescription: null,
    template: false,
    hostId: null,
    strategySlug: null,
    teamId: 'teamId',
    publishedAt: new Date(),
    plausibleToken: null,
    website: null,
    showShareButton: null,
    showLikeButton: null,
    showDislikeButton: null,
    displayTitle: null,
    showHosts: null,
    showChatButtons: null,
    showReactionButtons: null,
    showLogo: null,
    showMenu: null,
    showDisplayTitle: null,
    menuButtonIcon: null,
    logoImageBlockId: null,
    menuStepBlockId: null,
    socialNodeX: null,
    socialNodeY: null,
    fromTemplateId: null,
    journeyCustomizationDescription: null,
    primaryImageBlockId: null,
    creatorImageBlockId: null,
    creatorDescription: null,
    themeMode: 'light' as any,
    themeName: 'base' as any
  }

  const mockJob = {
    name: 'profile-create',
    data: {
      createdProfile: mockCreatedProfile,
      user: mockUser
    }
  } as unknown as Job<{ createdProfile: JourneyProfile; user: User }>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('service', () => {
    it('should process profile-create job and update journeys when acceptedTermsAt is not null', async () => {
      prismaMock.journey.findMany.mockResolvedValue([mockJourney])
      prismaMock.journey.update.mockResolvedValue(mockJourney)

      await service(mockJob)

      expect(prismaMock.journey.findMany).toHaveBeenCalledWith({
        where: { userJourneys: { some: { userId: 'userId' } } }
      })

      expect(prismaMock.journey.update).toHaveBeenCalledWith({
        where: { id: 'journeyId1' },
        data: { guestJourney: false }
      })

      expect(mockMailChimpSyncUser).toHaveBeenCalledWith(mockUser)
    })

    it('should process profile-create job without updating journeys when acceptedTermsAt is null', async () => {
      const profileWithoutAcceptedTerms = {
        ...mockCreatedProfile,
        acceptedTermsAt: null
      }

      const jobWithoutAcceptedTerms = {
        ...mockJob,
        data: {
          createdProfile: profileWithoutAcceptedTerms,
          user: mockUser
        }
      } as unknown as Job<{ createdProfile: JourneyProfile; user: User }>

      await service(jobWithoutAcceptedTerms)

      expect(prismaMock.journey.findMany).not.toHaveBeenCalled()
      expect(prismaMock.journey.update).not.toHaveBeenCalled()
      expect(mockMailChimpSyncUser).toHaveBeenCalledWith(mockUser)
    })

    it('should handle multiple journeys for a user', async () => {
      const multipleJourneys = [
        { ...mockJourney, id: 'journeyId1' },
        { ...mockJourney, id: 'journeyId2' },
        { ...mockJourney, id: 'journeyId3' }
      ]

      prismaMock.journey.findMany.mockResolvedValue(multipleJourneys)
      prismaMock.journey.update.mockResolvedValue(mockJourney)

      await service(mockJob)

      expect(prismaMock.journey.findMany).toHaveBeenCalledWith({
        where: { userJourneys: { some: { userId: 'userId' } } }
      })

      expect(prismaMock.journey.update).toHaveBeenCalledTimes(3)
      expect(prismaMock.journey.update).toHaveBeenCalledWith({
        where: { id: 'journeyId1' },
        data: { guestJourney: false }
      })
      expect(prismaMock.journey.update).toHaveBeenCalledWith({
        where: { id: 'journeyId2' },
        data: { guestJourney: false }
      })
      expect(prismaMock.journey.update).toHaveBeenCalledWith({
        where: { id: 'journeyId3' },
        data: { guestJourney: false }
      })

      expect(mockMailChimpSyncUser).toHaveBeenCalledWith(mockUser)
    })

    it('should handle case when user has no journeys', async () => {
      prismaMock.journey.findMany.mockResolvedValue([])

      await service(mockJob)

      expect(prismaMock.journey.findMany).toHaveBeenCalledWith({
        where: { userJourneys: { some: { userId: 'userId' } } }
      })

      expect(prismaMock.journey.update).not.toHaveBeenCalled()
      expect(mockMailChimpSyncUser).toHaveBeenCalledWith(mockUser)
    })

    it('should handle unknown job name', async () => {
      const unknownJob = {
        ...mockJob,
        name: 'unknown-job'
      } as unknown as Job<{ createdProfile: JourneyProfile; user: User }>

      await service(unknownJob)

      expect(prismaMock.journey.findMany).not.toHaveBeenCalled()
      expect(prismaMock.journey.update).not.toHaveBeenCalled()
      expect(mockMailChimpSyncUser).not.toHaveBeenCalled()
    })
  })
})
