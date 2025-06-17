import { Prisma, PrismaClient } from '.prisma/api-journeys-client'

const prisma = new PrismaClient()

async function upsertTeam(tx: Prisma.TransactionClient, teamData) {
  await tx.team.upsert({
    where: { id: teamData.id },
    update: teamData,
    create: teamData
  })
}

async function getExistingJourney(tx: Prisma.TransactionClient, journeySlug) {
  return tx.journey.findUnique({
    where: { slug: journeySlug }
  })
}

async function deleteJourney(tx: Prisma.TransactionClient, journeySlug) {
  await tx.journey.delete({
    where: { slug: journeySlug }
  })
}

async function upsertJourney(tx: Prisma.TransactionClient, journeyData) {
  await tx.journey.upsert({
    where: { id: journeyData.id },
    update: journeyData,
    create: journeyData
  })
}

async function getExistingUserTeam(
  tx: Prisma.TransactionClient,
  userId,
  teamId
) {
  return tx.userTeam.findUnique({
    where: { teamId_userId: { teamId, userId } }
  })
}

async function deleteUserTeam(tx: Prisma.TransactionClient, userId, teamId) {
  await tx.userTeam.delete({
    where: { teamId_userId: { teamId, userId } }
  })
}

async function upsertUserTeam(
  tx: Prisma.TransactionClient,
  teamId,
  userTeamData
) {
  await tx.userTeam.upsert({
    where: { id: userTeamData.id },
    update: userTeamData,
    create: { ...userTeamData, team: { connect: { id: teamId } } }
  })
}

async function getExistingJourneyProfile(tx: Prisma.TransactionClient, userId) {
  return tx.journeyProfile.findUnique({
    where: { userId }
  })
}

async function deleteJourneyProfile(tx: Prisma.TransactionClient, userId) {
  await tx.journeyProfile.delete({
    where: { userId }
  })
}

async function upsertJourneyProfile(
  tx: Prisma.TransactionClient,
  journeyProfileData
) {
  await tx.journeyProfile.upsert({
    where: { userId: journeyProfileData.userId },
    update: journeyProfileData,
    create: journeyProfileData
  })
}

async function upsertUserRole(tx: Prisma.TransactionClient, userRoleData) {
  await tx.userRole.upsert({
    where: { userId: userRoleData.userId },
    update: userRoleData,
    create: userRoleData
  })
}

async function connectJourneyToTeam(
  tx: Prisma.TransactionClient,
  journeyId,
  teamData
) {
  await tx.team.upsert({
    where: { id: teamData.id },
    update: teamData,
    create: { ...teamData, journeys: { connect: { id: journeyId } } }
  })
}

export async function createPlayWrightUserAccess(
  userTeamData,
  teamData,
  journeyData,
  journeyProfileData,
  userRoleData
): Promise<void> {
  await prisma.$transaction(
    async (tx) => {
      await upsertTeam(tx, teamData)
      const existingJourney = await getExistingJourney(tx, journeyData.slug)

      if (existingJourney != null && existingJourney.id !== journeyData.id) {
        await deleteJourney(tx, journeyData.slug)
      }
      await upsertJourney(tx, journeyData)
      await connectJourneyToTeam(tx, journeyData.id, teamData)

      const existingUserTeam = await getExistingUserTeam(
        tx,
        userTeamData.userId,
        teamData.id
      )

      if (existingUserTeam != null) {
        await deleteUserTeam(tx, userTeamData.userId, teamData.id)
      }
      await upsertUserTeam(tx, teamData.id, userTeamData)

      const existingJourneyProfile = await getExistingJourneyProfile(
        tx,
        journeyProfileData.userId
      )

      if (
        existingJourneyProfile != null &&
        existingJourneyProfile.id !== journeyProfileData.id
      ) {
        await deleteJourneyProfile(tx, journeyProfileData.userId)
      }
      await upsertJourneyProfile(tx, journeyProfileData)
      await upsertUserRole(tx, userRoleData)
    },
    {
      timeout: 10000
    }
  )
}
