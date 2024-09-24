import { PrismaClient } from '.prisma/api-journeys-client'

const prisma = new PrismaClient()

export async function formBlocksDelete(): Promise<void> {
  await prisma.block.deleteMany({
    where: { typename: 'FormBlock' }
  })
  await prisma.journeyProfile.updateMany({
    data: {
      onboardingFormCompletedAt: null
    }
  })
}
