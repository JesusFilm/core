"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const tslib_1 = require("tslib");
const api_journeys_client_1 = require(".prisma/api-journeys-client");
const globalForPrisma = global;
tslib_1.__exportStar(require(".prisma/api-journeys-client"), exports);
exports.prisma = globalForPrisma.prisma || new api_journeys_client_1.PrismaClient();
//# sourceMappingURL=client.js.map