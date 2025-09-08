import { User } from '@core/nest/common/firebaseClient'
import { JourneyProfile } from '@core/prisma/journeys/client'

export interface ProfileCreateJob {
  createdProfile: JourneyProfile
  user: User
}
