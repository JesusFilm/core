"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formBlocksDelete = formBlocksDelete;
const tslib_1 = require("tslib");
const client_1 = require("../../../../libs/prisma/journeys/src/client");
const prisma = new client_1.PrismaClient();
function formBlocksDelete() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const blocks = yield prisma.block.findMany({
            where: { typename: 'FormBlock' }
        });
        yield prisma.block.deleteMany({
            where: { id: { in: blocks.map((block) => block.id) } }
        });
        function updateSiblings(block) {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const siblings = yield prisma.block.findMany({
                    where: {
                        journeyId: block.journeyId,
                        parentBlockId: block.parentBlockId,
                        parentOrder: { not: null },
                        deletedAt: null
                    },
                    orderBy: { parentOrder: 'asc' },
                    include: { action: true }
                });
                yield Promise.all(siblings.map((block, parentOrder) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    return yield prisma.block.update({
                        where: { id: block.id },
                        data: { parentOrder },
                        include: { action: true }
                    });
                })));
            });
        }
        yield Promise.all(blocks.map((block) => tslib_1.__awaiter(this, void 0, void 0, function* () { return yield updateSiblings(block); })));
    });
}
//# sourceMappingURL=formBlocksDelete.js.map