// version 14
// increment to trigger re-seed (ie: files other than seed.ts are changed)

import { formBlocksDelete } from './seeds/formBlocksDelete'
import { jfpTeam } from './seeds/jfpTeam'
import { nua1 } from './seeds/nua1'
import { nua2 } from './seeds/nua2'
import { nua8 } from './seeds/nua8'
import { nua9 } from './seeds/nua9'
import { onboarding } from './seeds/onboarding'
import { onboardingTemplates } from './seeds/onboardingTemplates'
import { playwrightUserAccess } from './seeds/playwrightUserAccess'

async function main(): Promise<void> {
  // this should be removed when the UI can support team management
  await jfpTeam()

  await nua9()
  await nua8()
  await nua2()
  await nua1()
  await onboarding()
  await onboardingTemplates()
  await playwrightUserAccess()

  await formBlocksDelete()
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
