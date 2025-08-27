import { runCrowdinIdOperation } from '../populateCrowdinIds'

export async function service(): Promise<void> {
  await runCrowdinIdOperation()
}
