import {
  AlertChannel,
  AlertChannelSubscription,
  BrowserCheck,
  RetryStrategyBuilder
} from 'checkly/constructs'

// Keep the deployed logical ID after the watch-e2e -> resources-e2e move.
// Checkly loads constructs before testMatch and skips their script entrypoints,
// so watch.monitor.ts is not also registered as a second browser check.
const watch = new BrowserCheck(
  'apps/watch-e2e/src/monitoring/watch.monitor.ts',
  {
    name: 'watch.monitor.ts',
    activated: true,
    muted: false,
    code: { entrypoint: './watch.monitor.ts' },
    // Existing Jesus Film Project channels, verified in Checkly on 2026-10-20.
    // References preserve channel configuration and other checks' subscriptions.
    alertChannels: [
      AlertChannel.fromId(167086), // Email
      AlertChannel.fromId(194069), // Email / SSL expiry
      AlertChannel.fromId(342228), // Email
      AlertChannel.fromId(197137), // Slack: apps-monitoring
      AlertChannel.fromId(215031), // Slack: ds-emergency
      AlertChannel.fromId(266287), // SMS
      AlertChannel.fromId(258537) // Incident.io: Watch Alerts -> Watch Monitor
    ],
    // Preserve the live retry policy; comments in the Playwright script do not
    // configure Checkly's scheduled retries.
    retryStrategy: RetryStrategyBuilder.fixedStrategy({
      maxRetries: 8,
      baseBackoffSeconds: 10,
      maxDurationSeconds: 600,
      sameRegion: false
    })
  }
)

// Manage the unwanted subscriptions as explicitly inactive, rather than
// relying on their omission to remove previously auto-assigned UI subscriptions.
for (const channelId of [
  258447, // Incident.io: Journeys Admin Alerts
  258535, // Incident.io: Journeys Alerts
  258536 // Incident.io: Watch Redirections Alerts
]) {
  const channel = AlertChannel.fromId(channelId)
  new AlertChannelSubscription(
    `check-alert-channel-subscription#${watch.logicalId}#${channel.logicalId}`,
    {
      checkId: watch.ref(),
      alertChannelId: channel.ref(),
      activated: false
    }
  )
}
