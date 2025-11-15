import { Job } from 'bullmq'
import { Logger } from 'pino'

import { User } from '@core/nest/common/firebaseClient'
import { JourneyProfile, prisma } from '@core/prisma/journeys/client'

import { mailChimpSyncUser } from './mailChimpSyncUser'

interface ProfileCreateJob {
  createdProfile: JourneyProfile
  user: User
}

export async function service(
  job: Job<ProfileCreateJob>,
  logger?: Logger
): Promise<void> {
  switch (job.name) {
    case 'profile-create':
      await profileCreate(job, logger)
      break
  }
}

async function profileCreate(
  job: Job<ProfileCreateJob>,
  logger?: Logger
): Promise<void> {
  const { createdProfile, user } = job.data

  if (createdProfile.acceptedTermsAt != null) {
    const journeys = await prisma.journey.findMany({
      where: { userJourneys: { some: { userId: createdProfile.userId } } }
    })

    await Promise.all(
      journeys.map(async (journey) => {
        await prisma.journey.update({
          where: { id: journey.id },
          data: { guestJourney: false }
        })
      })
    )
  }
  try {
    await mailChimpSyncUser(user)
  } catch (error) {
    logger?.error('Error syncing user to MailChimp', error)
  }
}
