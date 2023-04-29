import { PrismaClient } from '.prisma/api-journeys-client'

const prisma = new PrismaClient()

// this should be removed when the UI can support team management
export async function jfpTeam(): Promise<void> {
  await prisma.$connect()
  const data = {
    title: 'Jesus Film Project',
    contactEmail: 'sway.ciaramello@jesusfilm.org'
  }
  // create JFP team (teams)
  const team = await prisma.team.upsert({
    where: {
      id: 'jfp-team'
    },
    create: {
      ...data,
      id: 'jfp-team',
      createdAt: new Date()
    },
    update: {
      ...data
    }
  })

  // update all journeys to belong to JFP team (journeys)
  await prisma.journey.updateMany({
    data: { teamId: team.id }
  })

  // add all users to JFP team (members)
  const userJourneys = await prisma.userJourney.findMany()
  await prisma.member.createMany({
    data: userJourneys.map((userJourney) => ({
      id: `${userJourney.userId}:${team.id}`,
      teamId: team.id,
      userId: userJourney.userId,
      createdAt: new Date()
    })),
    skipDuplicates: true
  })
}
