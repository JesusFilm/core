import { v4 as uuidv4 } from 'uuid'

import { Prisma, PrismaClient } from '.prisma/api-journeys-client'

import {
  JourneyStatus,
  Role,
  ThemeMode,
  ThemeName,
  UserTeamRole
} from '../../src/app/__generated__/graphql'

const prisma = new PrismaClient()

const TEAM_ID = 'playwright-team'
const JOURNEY_SLUG = 'playwright-testing-journey'

export async function playwrightUserAccess(): Promise<void> {
  // first user
  const userId = process.env.PLAYWRIGHT_USER_ID ?? ''
  const journeyProfileId = uuidv4()
  const userTeamId = uuidv4()

  const journeyData = {
    id: '9161c4ef-204d-4be9-8fdf-5bf514c13b9d',
    title: 'Playwright Journey',
    seoTitle: 'Playwright',
    languageId: '529',
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    slug: JOURNEY_SLUG,
    status: JourneyStatus.published,
    teamId: TEAM_ID,
    createdAt: new Date(),
    publishedAt: new Date()
  }

  const teamData = {
    id: TEAM_ID,
    title: 'Playwright'
  }

  const userTeamData = {
    id: userTeamId,
    userId,
    role: UserTeamRole.manager,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const journeyProfileData = {
    id: journeyProfileId,
    userId,
    acceptedTermsAt: new Date(),
    lastActiveTeamId: TEAM_ID
  }

  const userRoleData = {
    userId,
    roles: [Role.publisher]
  }

  // second user
  const userId2 = process.env.PLAYWRIGHT_USER_ID_2 ?? ''
  const journeyProfileId2 = uuidv4()
  const userTeamId2 = uuidv4()

  const journeyData2 = {
    id: 'b89e62a1-bf4a-4392-a09c-01ac97af5431',
    title: 'Playwright Journey',
    seoTitle: 'Playwright',
    languageId: '529',
    themeMode: ThemeMode.dark,
    themeName: ThemeName.base,
    slug: `${JOURNEY_SLUG}-2`,
    status: JourneyStatus.published,
    teamId: `${TEAM_ID}-2`
  }

  const teamData2 = {
    id: `${TEAM_ID}-2`,
    title: 'Playwright 2'
  }

  const userTeamData2 = {
    id: userTeamId2,
    userId: userId2,
    role: UserTeamRole.manager
  }

  const journeyProfileData2 = {
    id: journeyProfileId2,
    userId: userId2,
    acceptedTermsAt: new Date(),
    lastActiveTeamId: `${TEAM_ID}-2`
  }

  const userRoleData2 = {
    userId: userId2,
    roles: [Role.publisher]
  }

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
    console.log('deleting journey since it exists', journeySlug)
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
    console.log('deleting user team since it exists', userId, teamId)
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

  async function getExistingJourneyProfile(
    tx: Prisma.TransactionClient,
    userId
  ) {
    return tx.journeyProfile.findUnique({
      where: { userId }
    })
  }

  async function deleteJourneyProfile(tx: Prisma.TransactionClient, userId) {
    console.log('deleting journey profile since it exists', userId)
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

  async function createPlayWrightUserAccess(
    userTeamData,
    teamData,
    journeyData,
    journeyProfileData,
    userRoleData
  ): Promise<void> {
    await prisma.$transaction(
      async (tx) => {
        // looks for a team with the id and creates it if it doesn't exist
        await upsertTeam(tx, teamData)

        // looks for a journey with the slug and deletes it if it exists
        const existingJourney = await getExistingJourney(tx, journeyData.slug)

        if (existingJourney != null && existingJourney.id !== journeyData.id) {
          // deletes the journey if it exists
          await deleteJourney(tx, journeyData.slug)
        }

        // creates the journey if it doesn't exist
        await upsertJourney(tx, journeyData)

        // connects the journey to the team
        await connectJourneyToTeam(tx, journeyData.id, teamData)

        // looks for a user team with the userId and teamId
        const existingUserTeam = await getExistingUserTeam(
          tx,
          userTeamData.userId,
          teamData.id
        )

        if (existingUserTeam != null) {
          // deletes the user team if it exists
          await deleteUserTeam(tx, userTeamData.userId, teamData.id)
        }

        // creates the user team if it doesn't exist
        await upsertUserTeam(tx, teamData.id, userTeamData)

        // looks for a journey profile with the userId
        const existingJourneyProfile = await getExistingJourneyProfile(
          tx,
          journeyProfileData.userId
        )

        if (
          existingJourneyProfile != null &&
          existingJourneyProfile.id !== journeyProfileData.id
        ) {
          // deletes the journey profile if it exists
          await deleteJourneyProfile(tx, journeyProfileData.userId)
        }

        // creates the journey profile if it doesn't exist
        await upsertJourneyProfile(tx, journeyProfileData)

        // creates the user role with publisher access if it doesn't exist
        await upsertUserRole(tx, userRoleData)
      },
      {
        timeout: 10000
      }
    )
  }

  console.log(`giving playwright user access to ${userId} started`)

  await createPlayWrightUserAccess(
    userTeamData,
    teamData,
    journeyData,
    journeyProfileData,
    userRoleData
  )

  console.log(`giving playwright user access to ${userId} ended`)

  console.log(`giving playwright user access to ${userId2} started`)

  await createPlayWrightUserAccess(
    userTeamData2,
    teamData2,
    journeyData2,
    journeyProfileData2,
    userRoleData2
  )

  console.log(`giving playwright user access to ${userId2} ended`)
}
