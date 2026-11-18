import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../../..')
const baseline = process.argv.includes('--baseline')
const reportDirectory = resolve(root, 'coverage/apis/api-auth')
const tests = JSON.parse(
  readFileSync(resolve(reportDirectory, 'tests.json'), 'utf8')
) as {
  numTotalTests: number
  numPassedTests: number
  numPendingTests: number
  numTodoTests: number
}
assert(tests.numTotalTests > 0, 'No tests ran')
assert.equal(tests.numPassedTests, tests.numTotalTests, 'Every test must pass')
assert.equal(tests.numPendingTests, 0, 'Database suites must not skip')
assert.equal(tests.numTodoTests, 0, 'Database suites must not leave TODO tests')

type FileCoverage = {
  statementMap: Record<
    string,
    { start: { line: number }; end: { line: number } }
  >
  s: Record<string, number>
}
const coverage = JSON.parse(
  readFileSync(resolve(reportDirectory, 'coverage-final.json'), 'utf8')
) as Record<string, FileCoverage>
const cobertura = readFileSync(
  resolve(reportDirectory, 'cobertura-coverage.xml'),
  'utf8'
)
// Fail CI if renewal or its real owning-service read path loses instrumentation.
// Source anchors avoid coupling this guard to shifting line numbers.
const required: Record<string, string[]> = {
  "apis/api-auth/src/connections.ts": [
    "const expiresAt = calculateExpiry(approvedAt, review.duration)",
    "await tx.agentConnection.update(",
    "await audit(tx, 'renewal', 'allowed'"
  ],
  "apis/api-journeys/src/lib/mcpReadSettlement.ts": [
    "const pending = await db.mcpReadExecution.findMany",
    "await tx.mcpReadExecution.updateMany",
    "await postJson(",
    "await db.mcpReadExecution.update(",
    "failed++"
  ],
  "apis/api-journeys/src/lib/mcpReads.ts": [
    "const data = await snapshot(",
    "await authority('accept',",
    "await db.mcpReadExecution.create(",
    "const execution = await tx.mcpReadExecution.findUniqueOrThrow",
    "await tx.mcpReadExecution.update(",
    "await reconcileJourneyReads(db, config, permitId)",
    "await reconcileJourneyReads(db, config, readPermit).catch("
  ],
  "apis/api-gateway/src/mcpReads.ts": [
    "const response = await fetch(config.ownerUrl,"
  ],
  "apis/api-mcp/src/reads.ts": [
    "releases.push("
  ]
}
for (const [file, anchors] of Object.entries(required)) {
  // The actual predecessor can predate renewal or withdrawal. Never exempt
  // an implemented predecessor participant from instrumentation checks.
  if (baseline && !existsSync(resolve(root, file))) {
    console.log(`Baseline predates ${file}`)
    continue
  }
  assert(
    cobertura.includes(`filename="${file}"`),
    `Missing repository-relative Codecov path: ${file}`
  )
  const absolute = resolve(root, file)
  const entry = coverage[absolute]
  assert(entry, `Missing owning-service coverage: ${file}`)
  assert(Object.values(entry.s).some((hits) => hits > 0), `No execution hits in ${file}`)
  const lines = readFileSync(absolute, 'utf8').split('\n')
  for (const anchor of anchors) {
    const line = lines.findIndex((value) => value.includes(anchor)) + 1
    if (baseline && line === 0) {
      console.log(`Baseline predates source anchor in ${file}: ${anchor}`)
      continue
    }
    assert(line > 0, `Missing source anchor: ${anchor}`)
    assert(
      Object.entries(entry.statementMap).some(
        ([id, range]) => range.start.line === line && entry.s[id] > 0
      ),
      `No execution hits at ${file}:${line} (${anchor})`
    )
    console.log(`Verified execution hits at ${file}:${line}`)
  }
}
console.log(`Verified ${tests.numPassedTests} passing tests with no skips`)
