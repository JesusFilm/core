"use strict";
// version 14
// increment to trigger re-seed (ie: files other than seed.ts are changed)
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const formBlocksDelete_1 = require("./seeds/formBlocksDelete");
const jfpTeam_1 = require("./seeds/jfpTeam");
const nua1_1 = require("./seeds/nua1");
const nua2_1 = require("./seeds/nua2");
const nua8_1 = require("./seeds/nua8");
const nua9_1 = require("./seeds/nua9");
const onboarding_1 = require("./seeds/onboarding");
const onboardingTemplates_1 = require("./seeds/onboardingTemplates");
const playwrightUserAccess_1 = require("./seeds/playwrightUserAccess");
function main() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        // this should be removed when the UI can support team management
        yield (0, jfpTeam_1.jfpTeam)();
        yield (0, nua9_1.nua9)();
        yield (0, nua8_1.nua8)();
        yield (0, nua2_1.nua2)();
        yield (0, nua1_1.nua1)();
        yield (0, onboarding_1.onboarding)();
        yield (0, onboardingTemplates_1.onboardingTemplates)();
        yield (0, playwrightUserAccess_1.playwrightUserAccess)();
        yield (0, formBlocksDelete_1.formBlocksDelete)();
    });
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map