"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jfpTeam = jfpTeam;
const tslib_1 = require("tslib");
const client_1 = require("../../src/client");
const prisma = new client_1.PrismaClient();
function jfpTeam() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        // create JFP team (team for seeded journeys)
        yield prisma.team.upsert({
            where: { id: 'jfp-team' },
            update: {},
            create: {
                id: 'jfp-team',
                title: 'Jesus Film Project'
            }
        });
    });
}
//# sourceMappingURL=jfpTeam.js.map