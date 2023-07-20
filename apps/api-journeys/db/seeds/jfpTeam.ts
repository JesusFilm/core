import { PrismaClient } from '.prisma/api-journeys-client'

const prisma = new PrismaClient()

// this should be removed when the UI can support team management
export async function jfpTeam(): Promise<void> {
  // create JFP team (teams)
  await prisma.team.upsert({
    where: { id: 'jfp-team' },
    update: {},
    create: {
      id: 'jfp-team',
      title: 'Jesus Film Project'
    }
  })
}
