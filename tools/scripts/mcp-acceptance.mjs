import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

import * as acceptanceModule from '../../apis/api-mcp/src/acceptance.ts'
import * as releaseModule from '../../apis/api-mcp/src/release.ts'
import { executeLocalSuite } from './mcp-acceptance-local.mjs'

const {
  acceptanceCases,
  evidenceDigest,
  evidenceLedger,
  executedCounts,
  localSuites,
  registryDigest,
  registryRows,
  releaseChecks,
  validateAcceptance
} = acceptanceModule.default ?? acceptanceModule
const { validateRelease } = releaseModule.default ?? releaseModule

const json = async (path) => JSON.parse(await readFile(path, 'utf8'))
const save = (path, value) =>
  writeFile(path, JSON.stringify(value, null, 2) + '\n')

export async function verifyArtifacts(ledger, directory) {
  const root = await realpath(directory)
  for (const record of ledger.records)
    for (const artifact of record.artifacts) {
      const path = await realpath(resolve(root, artifact.path))
      if (!path.startsWith(root + sep))
        throw new Error('Artifact outside evidence directory')
      const digest = createHash('sha256')
        .update(await readFile(path))
        .digest('hex')
      if (digest !== artifact.sha256)
        throw new Error('Artifact digest mismatch')
    }
}

export async function createAcceptancePlan(
  manifest,
  directory,
  now = new Date()
) {
  const release = validateRelease(manifest)
  await mkdir(directory, { recursive: true })
  const ledger = {
    schemaVersion: 1,
    sourceCommit: release.sourceCommit,
    releaseDigest: evidenceDigest(release),
    registryDigest,
    notBefore: now.toISOString(),
    records: []
  }
  await save(resolve(directory, 'ledger.json'), ledger)
  await save(resolve(directory, 'plan.json'), {
    qualification: 'unexecuted',
    productionApproved: false,
    ...ledger,
    acceptanceCases,
    registryRows,
    controlledLocalSuites: localSuites,
    checks: releaseChecks().map((check) => ({ ...check, status: 'unexecuted' }))
  })
}

export async function runLocalAcceptance(
  directory,
  selected = localSuites.map((suite) => suite.id)
) {
  if (
    !selected.length ||
    new Set(selected).size !== selected.length ||
    selected.some((id) => !localSuites.some((suite) => suite.id === id))
  )
    throw new Error('Unknown or duplicate suite')
  const root = resolve(directory)
  await mkdir(root, { recursive: true })
  const command = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' })
  if (command.status !== 0) throw new Error('Missing source revision')
  const sourceCommit = command.stdout.trim()
  const status = spawnSync('git', ['status', '--porcelain'], {
    encoding: 'utf8'
  })
  if (status.status !== 0) throw new Error('Cannot verify worktree')
  const worktreeDirty = status.stdout.length > 0
  const results = []
  try {
    for (const id of selected) {
      const suite = localSuites.find((item) => item.id === id)
      // A previous successful report cannot survive a failed or skipped run.
      await rm(resolve(root, `${id}-tests.json`), { force: true })
      await rm(resolve(root, id), { recursive: true, force: true })
      const startedAt = new Date().toISOString()
      const reportBytes = await executeLocalSuite(suite, root)
      const counts = executedCounts(JSON.parse(reportBytes))
      await writeFile(resolve(root, `${id}-tests.json`), reportBytes)
      results.push({
        id,
        sourceCommit,
        registryDigest,
        environment: 'local',
        participant: 'controlled-local',
        startedAt,
        finishedAt: new Date().toISOString(),
        status: 'passed',
        counts,
        config: suite.config,
        report: `${id}-tests.json`,
        sha256: createHash('sha256').update(reportBytes).digest('hex')
      })
      await save(resolve(root, 'local-results.json'), {
        sourceCommit,
        worktreeDirty,
        registryDigest,
        qualification: 'local-only',
        complete: results.length === localSuites.length,
        productionApproved: false,
        results
      })
    }
  } catch {
    await save(resolve(root, 'local-results.json'), {
      sourceCommit,
      worktreeDirty,
      registryDigest,
      qualification: 'failed',
      complete: false,
      productionApproved: false,
      results
    })
    throw new Error('Local acceptance failed; inspect the owning suite output')
  }
}

export async function acceptanceCommand(args, write = console.log) {
  try {
    const [mode, first, second, ...rest] = args
    if (mode === 'plan' && first && second && !rest.length)
      await createAcceptancePlan(await json(first), second)
    else if (mode === 'local' && first)
      await runLocalAcceptance(
        first,
        [second, ...rest].filter(Boolean).length
          ? [second, ...rest].filter(Boolean)
          : undefined
      )
    else if (mode === 'verify-stage' && first && second && !rest.length) {
      const ledger = evidenceLedger.parse(await json(first))
      const result = validateAcceptance(ledger, await json(second))
      await verifyArtifacts(ledger, dirname(resolve(first)))
      write(JSON.stringify(result))
      return 0
    } else throw new Error('Arguments')
    write(
      'Acceptance artifacts recorded. Staging, real-client qualification and production approval remain separate.'
    )
    return 0
  } catch {
    write(
      'Acceptance failed. Check arguments, candidate versions, execution counts, participants and evidence files. No release was approved.'
    )
    return 1
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
)
  process.exitCode = await acceptanceCommand(process.argv.slice(2))
