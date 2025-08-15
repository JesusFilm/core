import { PrismaClient } from '../../../../libs/prisma/journeys/src/client'

const prisma = new PrismaClient()

export async function jfpTeam(): Promise<void> {
  // create JFP team (team for seeded journeys)
  await prisma.team.upsert({
    where: { id: 'jfp-team' },
    update: {},
    create: {
      id: 'jfp-team',
      title: 'Jesus Film Project'
    }
  })
}
