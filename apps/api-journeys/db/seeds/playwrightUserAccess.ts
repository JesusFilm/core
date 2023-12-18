import { PrismaClient } from '.prisma/api-journeys-client'

const prisma = new PrismaClient()

export async function playwrightUserAccess(): Promise<void> {
  // TODO:
  // recreate the steps
  // accept terms and conditions - fill out the data that you need to do so
  // finish the onboarding form - fill out all the data needed to skip
  // finish the teams form - fill out all the data needed to skip
  const playwrightTeam = await prisma.team.upsert({
    where: { id: 'playwright-team' },
    update: {},
    create: {
      id: 'playwright-team',
      title: 'Jesus Film Project'
    }
  })

  const playwrightUser = await prisma.journeyProfile.findUnique({
    where: { userId: 'eSOfygik80gVvom4j1SAGqj6b3v2' }
  })

  const journeyProfile = {
    userId: playwrightUser?.userId ?? 'eSOfygik80gVvom4j1SAGqj6b3v2',
    acceptedTermsAt: new Date(),
    lastActiveTeamId: playwrightTeam.id,
    onboardingFormCompletedAt: new Date()
  }
  await prisma.journeyProfile.upsert({
    where: { userId: playwrightUser?.userId ?? '' },
    update: journeyProfile,
    create: journeyProfile
  })

  console.log('journeyProfile', journeyProfile)
}
