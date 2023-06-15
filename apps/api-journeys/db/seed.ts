// version 6
// increment to trigger re-seed (ie: files other than seed.ts are changed)

import { nua1 } from './seeds/nua1'
import { nua2 } from './seeds/nua2'
import { nua8 } from './seeds/nua8'
import { nua9 } from './seeds/nua9'
// import { jfpTeam } from './seeds/jfpTeam'
import { onboarding } from './seeds/onboarding'
import { onboardingTemplates } from './seeds/onboardingTemplates'
import { psMigrate } from './seeds/psMigrate'

async function main(): Promise<void> {
  // this should be removed when the UI can support team management
  // await jfpTeam()

  await nua1()
  await nua2()
  await nua8()
  await nua9()
  await onboarding()
  await onboardingTemplates()

  // commented out until future migration
  await psMigrate()
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
