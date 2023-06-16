import { aql } from 'arangojs'
import { PrismaClient, UserTeamRole } from '.prisma/api-journeys-client'
import { ArangoDB } from '../db'

const db = ArangoDB()
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

  const a = await prisma.host.create({
    data: {
      title: 'Cru International',
      location: 'Florida, USA',
      teamId: 'jfp-team',
      src1: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      src2: null
    }
  })

  const b = await prisma.host.create({
    data: {
      title: 'Anonymous',
      location: 'Bermuda Triangle',
      teamId: 'jfp-team',
      src1: null,
      src2: null
    }
  })

  const c = await prisma.host.create({
    data: {
      title: 'Multiple Creators',
      location: 'Worldwide',
      teamId: 'jfp-team',
      src1: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      src2: 'https://images.unsplash.com/photo-1651069188152-bf30b5af2a0d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1364&q=80'
    }
  })

  console.log('A, B, C seeded!', a, b, c)
}
