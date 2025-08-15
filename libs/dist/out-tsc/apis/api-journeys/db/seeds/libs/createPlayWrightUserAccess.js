"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPlayWrightUserAccess = createPlayWrightUserAccess;
const tslib_1 = require("tslib");
const client_1 = require("../../../../../libs/prisma/journeys/src/client");
const prisma = new client_1.PrismaClient();
function upsertTeam(tx, teamData) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield tx.team.upsert({
            where: { id: teamData.id },
            update: teamData,
            create: teamData
        });
    });
}
function getExistingJourney(tx, journeySlug) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return tx.journey.findUnique({
            where: { slug: journeySlug }
        });
    });
}
function deleteJourney(tx, journeySlug) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield tx.journey.delete({
            where: { slug: journeySlug }
        });
    });
}
function upsertJourney(tx, journeyData) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield tx.journey.upsert({
            where: { id: journeyData.id },
            update: journeyData,
            create: journeyData
        });
    });
}
function getExistingUserTeam(tx, userId, teamId) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return tx.userTeam.findUnique({
            where: { teamId_userId: { teamId, userId } }
        });
    });
}
function deleteUserTeam(tx, userId, teamId) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield tx.userTeam.delete({
            where: { teamId_userId: { teamId, userId } }
        });
    });
}
function upsertUserTeam(tx, teamId, userTeamData) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield tx.userTeam.upsert({
            where: { id: userTeamData.id },
            update: userTeamData,
            create: Object.assign(Object.assign({}, userTeamData), { team: { connect: { id: teamId } } })
        });
    });
}
function getExistingJourneyProfile(tx, userId) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return tx.journeyProfile.findUnique({
            where: { userId }
        });
    });
}
function deleteJourneyProfile(tx, userId) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield tx.journeyProfile.delete({
            where: { userId }
        });
    });
}
function upsertJourneyProfile(tx, journeyProfileData) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield tx.journeyProfile.upsert({
            where: { userId: journeyProfileData.userId },
            update: journeyProfileData,
            create: journeyProfileData
        });
    });
}
function upsertUserRole(tx, userRoleData) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield tx.userRole.upsert({
            where: { userId: userRoleData.userId },
            update: userRoleData,
            create: userRoleData
        });
    });
}
function connectJourneyToTeam(tx, journeyId, teamData) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield tx.team.upsert({
            where: { id: teamData.id },
            update: teamData,
            create: Object.assign(Object.assign({}, teamData), { journeys: { connect: { id: journeyId } } })
        });
    });
}
function createPlayWrightUserAccess(userTeamData, teamData, journeyData, journeyProfileData, userRoleData) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield prisma.$transaction((tx) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield upsertTeam(tx, teamData);
            const existingJourney = yield getExistingJourney(tx, journeyData.slug);
            if (existingJourney != null && existingJourney.id !== journeyData.id) {
                yield deleteJourney(tx, journeyData.slug);
            }
            yield upsertJourney(tx, journeyData);
            yield connectJourneyToTeam(tx, journeyData.id, teamData);
            const existingUserTeam = yield getExistingUserTeam(tx, userTeamData.userId, teamData.id);
            if (existingUserTeam != null) {
                yield deleteUserTeam(tx, userTeamData.userId, teamData.id);
            }
            yield upsertUserTeam(tx, teamData.id, userTeamData);
            const existingJourneyProfile = yield getExistingJourneyProfile(tx, journeyProfileData.userId);
            if (existingJourneyProfile != null &&
                existingJourneyProfile.id !== journeyProfileData.id) {
                yield deleteJourneyProfile(tx, journeyProfileData.userId);
            }
            yield upsertJourneyProfile(tx, journeyProfileData);
            yield upsertUserRole(tx, userRoleData);
        }), {
            timeout: 10000
        });
    });
}
//# sourceMappingURL=createPlayWrightUserAccess.js.map