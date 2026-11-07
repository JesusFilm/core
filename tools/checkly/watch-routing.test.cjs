const assert = require('node:assert/strict')
const path = require('node:path')
const { test } = require('node:test')

// Initialize the public entrypoint before loading the CLI's internal services.
require('checkly/constructs')

// Use the installed CLI's real project discovery, not a mocked construct.
// This intentionally exercises the pinned Checkly 6.x parser so an upgrade that
// changes entrypoint deduplication or subscription synthesis is caught.
const checklyDist = path.dirname(require.resolve('checkly'))
const { loadChecklyConfig } = require(
  path.join(checklyDist, 'services/checkly-config-loader.js')
)
const { parseProject } = require(
  path.join(checklyDist, 'services/project-parser.js')
)

test('Watch keeps its deployed identity and only its intended alert subscriptions', async () => {
  const directory = path.resolve(__dirname, '../..')
  const { config, constructs } = await loadChecklyConfig(
    directory,
    undefined,
    false
  )
  const project = await parseProject({
    directory,
    projectLogicalId: config.logicalId,
    projectName: config.projectName,
    repoUrl: config.repoUrl,
    checkMatch: config.checks.checkMatch,
    browserCheckMatch: config.checks.browserChecks.testMatch,
    checkDefaults: config.checks,
    browserCheckDefaults: config.checks.browserChecks,
    checklyConfigConstructs: constructs,
    availableRuntimes: {},
    defaultRuntimeId: config.checks.runtimeId
  })

  const logicalId = 'apps/watch-e2e/src/monitoring/watch.monitor.ts'
  const watch = project.data.check[logicalId]
  assert.ok(watch, 'update the existing deployed monitor, not a new logical ID')
  assert.equal(
    watch.resolveContentFilePath(watch.code.entrypoint),
    path.join(directory, 'apps/resources-e2e/src/monitoring/watch.monitor.ts')
  )
  assert.deepEqual(
    Object.keys(project.data.check).sort(),
    [
      'apps/journeys-admin-e2e/src/monitoring/journeys-admin.monitor.ts',
      'apps/journeys-e2e/src/monitoring/journeys.monitor.ts',
      'apps/resources-e2e/src/monitoring/watch-redirection.monitor.ts',
      logicalId
    ].sort(),
    'automatic discovery must not duplicate Watch or drop other monitors'
  )

  const subscriptions = Object.values(
    project.data['alert-channel-subscription']
  ).map((subscription) => subscription.synthesize())
  assert.equal(subscriptions.length, 10)
  assert.ok(
    subscriptions.every(
      (subscription) => subscription.checkId.ref === logicalId
    )
  )
  const channels = subscriptions.map((subscription) => ({
    id: project.data['alert-channel'][subscription.alertChannelId.ref]
      .physicalId,
    active: subscription.activated
  }))
  assert.deepEqual(
    channels
      .filter((channel) => channel.active)
      .map((channel) => channel.id)
      .sort(),
    [167086, 194069, 342228, 197137, 215031, 266287, 258537].sort()
  )
  assert.deepEqual(
    channels
      .filter((channel) => !channel.active)
      .map((channel) => channel.id)
      .sort(),
    [258447, 258535, 258536].sort()
  )
  assert.ok(
    Object.values(project.data['alert-channel']).every(
      (channel) => !channel.member
    ),
    'reuse existing channels without taking ownership of their configuration'
  )

  // Compare the JSON payload sent to Checkly, omitting undefined SDK fields.
  const payload = JSON.parse(JSON.stringify(watch.synthesize()))
  assert.equal(payload.frequency, 10)
  assert.deepEqual(payload.locations, ['us-east-1'])
  assert.equal(payload.runtimeId, '2024.02')
  assert.equal(payload.activated, true)
  assert.equal(payload.muted, false)
  assert.equal(payload.useGlobalAlertSettings, true)
  assert.deepEqual(payload.retryStrategy, {
    type: 'FIXED',
    maxRetries: 8,
    baseBackoffSeconds: 10,
    maxDurationSeconds: 600,
    sameRegion: false
  })
})
