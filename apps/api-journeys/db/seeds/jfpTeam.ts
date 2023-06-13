import { aql } from 'arangojs'
import { PrismaClient, UserTeamRole } from '.prisma/api-journeys-client'
import { ArangoDB } from '../db'

const db = ArangoDB()
const prisma = new PrismaClient()

// this should be removed when the UI can support team management
export async function jfpTeam(): Promise<void> {
  await prisma.$connect()
  const data = {
    title: 'Jesus Film Project',
    contactEmail: 'sway.ciaramello@jesusfilm.org'
  }
  // create JFP team (teams)
  await prisma.team.upsert({
    where: { id: 'jfp-team' },
    update: {},
    create: {
      id: 'jfp-team',
      title: 'Jesus Film Project'
    }
  })

  // copy all members (arango) to userTeams (postgres)
  const members = await (
    await db.query(aql` FOR member IN members RETURN member`)
  ).all()

  await Promise.all(
    members.map(async (member) => {
      await prisma.userTeam.upsert({
        where: {
          teamId_userId: { userId: member.userId, teamId: member.teamId }
        },
        update: {},
        create: {
          userId: member.userId,
          teamId: member.teamId,
          role: UserTeamRole.guest
        }
      })
    })
  )
}
