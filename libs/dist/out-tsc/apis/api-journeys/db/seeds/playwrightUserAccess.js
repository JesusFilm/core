"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playwrightUserAccess = playwrightUserAccess;
const tslib_1 = require("tslib");
const uuid_1 = require("uuid");
const graphql_1 = require("../../src/app/__generated__/graphql");
const createPlayWrightUserAccess_1 = require("./libs/createPlayWrightUserAccess");
const TEAM_ID = 'playwright-team';
const JOURNEY_SLUG = 'playwright-testing-journey';
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
];
function playwrightUserAccess() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        function createUserAccessData(userId, teamId, journeySlug, journeyId) {
            const journeyProfileId = (0, uuid_1.v4)();
            const userTeamId = (0, uuid_1.v4)();
            return {
                journeyData: {
                    id: journeyId,
                    title: 'Playwright Journey',
                    seoTitle: 'Playwright',
                    languageId: '529',
                    themeMode: graphql_1.ThemeMode.dark,
                    themeName: graphql_1.ThemeName.base,
                    slug: journeySlug,
                    status: graphql_1.JourneyStatus.published,
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
                    role: graphql_1.UserTeamRole.manager,
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
                    roles: [graphql_1.Role.publisher]
                }
            };
        }
        for (const data of PLAYWRIGHT_USER_DATA) {
            try {
                if (data.userId === undefined) {
                    throw new Error(`PLAYWRIGHT_USER_ID is not defined for teamId:  ${data.teamId}, journeySlug: ${data.journeySlug}`);
                }
                const { journeyData, teamData, userTeamData, journeyProfileData, userRoleData } = createUserAccessData(data.userId, data.teamId, data.journeySlug, data.journeyId);
                console.log(`giving playwright user access to ${data.userId} started`);
                yield (0, createPlayWrightUserAccess_1.createPlayWrightUserAccess)(userTeamData, teamData, journeyData, journeyProfileData, userRoleData);
                console.log(`giving playwright user access to ${data.userId} ended`);
            }
            catch (error) {
                console.error(error);
            }
        }
    });
}
//# sourceMappingURL=playwrightUserAccess.js.map