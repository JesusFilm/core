import { v4 as uuidv4 } from 'uuid'

import {
  JourneyStatus,
  Role,
  ThemeMode,
  ThemeName,
  UserTeamRole
} from '../../src/app/__generated__/graphql'

import { createPlayWrightUserAccess } from './libs/createPlayWrightUserAccess'

const TEAM_ID = 'playwright-team'
const JOURNEY_SLUG = 'playwright-testing-journey'

const PLAYWRIGHT_USER_DATA = [
  {
    journeyId: '9161c4ef-204d-4be9-8fdf-5bf514c13b9d',
    userId: process.env.PLAYWRIGHT_USER_ID,
    teamId: TEAM_ID,
    journeySlug: JOURNEY_SLUG
  },
  {
    journeyId: 'b89e62a1-bf4a-4392-a09c-01ac97af5431',
    userId: process.env.PLAYWRIGHT_USER_ID_2,
    teamId: `${TEAM_ID}-2`,
    journeySlug: `${JOURNEY_SLUG}-2`
  },
  {
    journeyId: '6a8e9056-3fd4-47d0-b370-8e0331eb5785',
    userId: process.env.PLAYWRIGHT_USER_ID_3,
    teamId: `${TEAM_ID}-3`,
    journeySlug: `${JOURNEY_SLUG}-3`
  },
  {
    journeyId: '6933d8e1-a6dd-4e6e-ae84-23178f62bd38',
    userId: process.env.PLAYWRIGHT_USER_ID_4,
    teamId: `${TEAM_ID}-4`,
    journeySlug: `${JOURNEY_SLUG}-4`
  },
  {
    journeyId: '8fdc0fa3-0e6c-4c75-8024-fb2f70bf51e3',
    userId: process.env.PLAYWRIGHT_USER_ID_5,
    teamId: `${TEAM_ID}-5`,
    journeySlug: `${JOURNEY_SLUG}-5`
  },
  {
    journeyId: '1858bb8f-83e0-4bbe-8629-9924abb5c75f',
    userId: process.env.PLAYWRIGHT_USER_ID_6,
    teamId: `${TEAM_ID}-6`,
    journeySlug: `${JOURNEY_SLUG}-6`
  }
]

interface UserAccessData {
  journeyData: {
    id: string
    title: string
    seoTitle: string
    languageId: string
    themeMode: ThemeMode
    themeName: ThemeName
    slug: string
    status: JourneyStatus
    teamId: string
    createdAt: Date
    publishedAt: Date
  }
  teamData: {
    id: string
    title: string
  }
  userTeamData: {
    id: string
    userId: string
    role: UserTeamRole
    createdAt?: Date
    updatedAt?: Date
  }
  journeyProfileData: {
    id: string
    userId: string
    acceptedTermsAt: Date
    lastActiveTeamId: string
  }
  userRoleData: {
    userId: string
    roles: Role[]
  }
}

export async function playwrightUserAccess(): Promise<void> {
  function createUserAccessData(
    userId: string,
    teamId: string,
    journeySlug: string,
    journeyId: string
  ): UserAccessData {
    const journeyProfileId = uuidv4()
    const userTeamId = uuidv4()

    return {
      journeyData: {
        id: journeyId,
        title: 'Playwright Journey',
        seoTitle: 'Playwright',
        languageId: '529',
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        slug: journeySlug,
        status: JourneyStatus.published,
        teamId: teamId,
        createdAt: new Date(),
        publishedAt: new Date()
      },
      teamData: {
        id: teamId,
        title: 'Playwright'
      },
      userTeamData: {
        id: userTeamId,
        userId,
        role: UserTeamRole.manager,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      journeyProfileData: {
        id: journeyProfileId,
        userId,
        acceptedTermsAt: new Date(),
        lastActiveTeamId: teamId
      },
      userRoleData: {
        userId,
        roles: [Role.publisher]
      }
    }
  }
  for (const data of PLAYWRIGHT_USER_DATA) {
    try {
      if (data.userId === undefined) {
        throw new Error(
          `PLAYWRIGHT_USER_ID is not defined for teamId:  ${data.teamId}, journeySlug: ${data.journeySlug}`
        )
      }

      const {
        journeyData,
        teamData,
        userTeamData,
        journeyProfileData,
        userRoleData
      } = createUserAccessData(
        data.userId,
        data.teamId,
        data.journeySlug,
        data.journeyId
      )

      console.log(`giving playwright user access to ${data.userId} started`)

      await createPlayWrightUserAccess(
        userTeamData,
        teamData,
        journeyData,
        journeyProfileData,
        userRoleData
      )

      console.log(`giving playwright user access to ${data.userId} ended`)
    } catch (error) {
      console.error(error)
    }
  }
}
