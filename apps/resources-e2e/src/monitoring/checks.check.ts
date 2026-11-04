import path from 'node:path'

import {
  AlertChannel,
  BrowserCheck,
  MultiStepCheck,
  RetryStrategyBuilder
} from 'checkly/constructs'

// Keep the deployed logical IDs when source directories move, preserving history.
new BrowserCheck('apps/watch-e2e/src/monitoring/watch.monitor.ts', {
  name: 'watch.monitor.ts',
  // Runtime 2024.02 lacks the H.264/AAC codecs needed for real playback.
  runtimeId: '2026.04',
  code: { entrypoint: path.join(__dirname, 'watch.monitor.ts') },
  retryStrategy: RetryStrategyBuilder.fixedStrategy({
    maxRetries: 1,
    baseBackoffSeconds: 30,
    maxDurationSeconds: 120,
    sameRegion: false
  })
})

new MultiStepCheck(
  'apps/watch-e2e/src/monitoring/watch-redirection.monitor.ts',
  {
    name: 'watch-redirection.monitor.ts',
    runtimeId: '2026.04',
    code: { entrypoint: path.join(__dirname, 'watch-redirection.api.ts') },
    retryStrategy: RetryStrategyBuilder.fixedStrategy({
      maxRetries: 8,
      baseBackoffSeconds: 10,
      maxDurationSeconds: 600,
      sameRegion: false
    })
  }
)

// Imported with deletion protection until this source is merged. The existing
// US browser Keywords check remains outside this project's ownership.
new MultiStepCheck('watch-pages-keywords-singapore-api-uDWZ3vYK', {
  name: 'Watch Pages – Keywords (Singapore API)',
  runtimeId: '2026.04',
  frequency: 10,
  locations: ['ap-southeast-1'],
  runParallel: false,
  tags: ['watch'],
  doubleCheck: false,
  useGlobalAlertSettings: true,
  alertChannels: [167086, 194069, 197137, 266287].map((id) =>
    AlertChannel.fromId(id)
  ),
  code: { entrypoint: path.join(__dirname, 'watch-keywords.api.ts') },
  retryStrategy: RetryStrategyBuilder.linearStrategy({
    maxRetries: 2,
    baseBackoffSeconds: 60,
    maxDurationSeconds: 600,
    sameRegion: true
  })
})
