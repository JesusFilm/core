import { Job } from 'bullmq'

import { User } from '@core/nest/common/firebaseClient'
import { JourneyProfile, prisma } from '@core/prisma/journeys/client'

import { mailChimpSyncUser } from './mailChimpSyncUser'

interface ProfileCreateJob {
  createdProfile: JourneyProfile
  user: User
}

export async function service(job: Job<ProfileCreateJob>): Promise<void> {
  switch (job.name) {
    case 'profile-create':
      await profileCreate(job)
      break
  }
}

async function profileCreate(job: Job<ProfileCreateJob>): Promise<void> {
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
  await mailChimpSyncUser(user)
}
