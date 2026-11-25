import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import {
  rollbackPlan,
  validateRelease
} from '../../apis/api-mcp/src/release.ts'

export async function checkReleaseFiles(paths, write = console.log) {
  try {
    if (paths.length < 1 || paths.length > 2) throw new Error('Arguments')
    const manifests = await Promise.all(
      paths.map(async (path) => JSON.parse(await readFile(path, 'utf8')))
    )
    const current = validateRelease(manifests[0])
    const plan =
      paths.length === 2
        ? rollbackPlan(current, manifests[1])
        : {
            kind: 'stage-configuration-plan',
            qualification: 'unexecuted',
            sourceCommit: current.sourceCommit
          }
    write(JSON.stringify(plan, null, 2))
    return 0
  } catch {
    write(
      'Release check failed. Validate the manifest against api-mcp/src/release.ts; no deployment was attempted.'
    )
    return 1
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
)
  process.exitCode = await checkReleaseFiles(process.argv.slice(2))
