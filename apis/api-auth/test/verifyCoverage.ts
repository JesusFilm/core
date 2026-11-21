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
  'apis/api-auth/src/permissions.ts': [
    'const collecting = page && allIds.length < page.gateCount',
    "if (manifest.status === 'collecting') return manifest"
  ],
  'apis/api-journeys/src/lib/mcpPermissions.ts': [
    'const gateIdsHash = fingerprint(execution.gateIds)',
    "state = await authority('status', { changeId: id })",
    'assertAccountCleanupResult(value)',
    'await authorizeAccountDeletionResume(execution, storedIntent)',
    'return accountCleanupResultSchema.parse(',
    'const receipt = intentSchema.parse(committed.intent)',
    'await enqueueShortLinkDeletes(effect.shortLinkIds, true)',
    'await enqueueTeamRemovedEmail(',
    'await enqueueTeamInviteAcceptedEmail(effect.notification, deliveryId)',
    'await syncMailChimp(effect.user)'
  ],

  'apis/api-users/src/schema/userDelete/service/resumeUserDeletion.ts': [
    'const firebaseUids = [',
    'progress.deletedUserFirebaseUid === callerFirebaseUid &&',
    'const logs = await deleteFirebaseUser(',
    'await prisma.userDeleteAuditLog.update('
  ],
  'apis/api-users/src/schema/userDelete/service/deleteUserData.ts': [
    'confirmedRetirements.add(uid)',
    'await tx.userDeleteAuditLog.update(',
    'await tx.user.delete(',
    'await retireAndDelete(fbUser.uid)'
  ],
  'apis/api-journeys/src/workers/email/teamInviteAccepted.ts': [
    'await queue.add('
  ],
  'apis/api-journeys/src/lib/syncMailChimp.ts': [
    'await mailchimp.lists.setListMember('
  ],
  'apis/api-journeys/src/schema/journeyProfile/journeyProfileCreate.mutation.ts':
    ["if (!capturePermissionEffect({ type: 'mailchimpSubscription', user }))"],
  'apis/api-journeys/src/schema/userTeamInvite/userTeamInviteAcceptAll.mutation.ts':
    ['const team = await prisma.team.findUnique('],
  'apis/api-journeys/src/workers/email/teamRemoved.ts': ['await queue.add('],
  'apis/api-auth/src/connections.ts': [
    'const expiresAt = calculateExpiry(approvedAt, review.duration)',
    'await tx.agentConnection.update(',
    "await audit(tx, 'renewal', 'allowed'"
  ],
  'apis/api-journeys/src/lib/mcpReadSettlement.ts': [
    'const pending = await db.mcpReadExecution.findMany',
    'await tx.mcpReadExecution.updateMany',
    'await postJson(',
    'await db.mcpReadExecution.update(',
    'failed++'
  ],
  'apis/api-journeys/src/lib/mcpReads.ts': [
    "if (request.tool === 'journey_preview')",
    'const allowedOperations = (journey: ReadJourney) => [',
    "await authority('accept',",
    'await db.mcpReadExecution.create(',
    'const execution = await tx.mcpReadExecution.findUniqueOrThrow',
    'await tx.mcpReadExecution.update(',
    'await reconcileJourneyReads(db, config, permitId)',
    'await reconcileJourneyReads(db, config, readPermit).catch('
  ],
  'apis/api-journeys/src/schema/journey/journeyPreview.query.ts': [
    "builder.queryField('journeyPreview'",
    "builder.queryField('journeyPublishPermission'",
    "throw new GraphQLError('preview unavailable'"
  ],
  'apis/api-journeys/src/lib/privatePreview.ts': [
    'const result = await executeFn(options)'
  ],
  'apis/api-gateway/src/mcpReads.ts': [
    'const response = await fetch(config.ownerUrl,'
  ],
  'apis/api-mcp/src/reads.ts': ['releases.push(']
}
for (const [file, anchors] of Object.entries(required)) {
  // The actual predecessor can predate renewal or withdrawal. Never exempt
  // an implemented predecessor participant from instrumentation checks.
  if (baseline && !existsSync(resolve(root, file))) {
    console.log(`Baseline predates ${file}`)
    continue
  }
  const absolute = resolve(root, file)
  const lines = readFileSync(absolute, 'utf8').split('\n')
  // An existing file can predate its MCP participant. Any implemented anchor
  // still requires both the owning-service report and execution hits below.
  if (
    baseline &&
    !anchors.some((anchor) => lines.some((line) => line.includes(anchor)))
  ) {
    console.log(`Baseline predates required source anchors in ${file}`)
    continue
  }
  assert(
    cobertura.includes(`filename="${file}"`),
    `Missing repository-relative Codecov path: ${file}`
  )
  const entry = coverage[absolute]
  assert(entry, `Missing owning-service coverage: ${file}`)
  assert(
    Object.values(entry.s).some((hits) => hits > 0),
    `No execution hits in ${file}`
  )
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
