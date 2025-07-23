'use client'

import { datadogRum } from '@datadog/browser-rum'

import { env } from '@/env'

/**
 * DatadogInit component for initializing Real User Monitoring (RUM)
 *
 * This component initializes Datadog RUM on the client side to collect
 * telemetry data from user browsers. It renders nothing but ensures
 * the initialization code runs in the client environment.
 *
 * @example
 * ```tsx
 * <DatadogInit />
 * ```
 */
export default function DatadogInit(): null {
  // Initialize Datadog RUM with configuration
  if (
    env.NEXT_PUBLIC_DATADOG_APPLICATION_ID &&
    env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN
  ) {
    datadogRum.init({
      applicationId: env.NEXT_PUBLIC_DATADOG_APPLICATION_ID,
      clientToken: env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
      site: env.NEXT_PUBLIC_DATADOG_SITE,
      service: 'watch-modern',
      env: env.NEXT_PUBLIC_DATADOG_ENV,
      version: env.NEXT_PUBLIC_DATADOG_VERSION,
      sessionSampleRate: 100,
      sessionReplaySampleRate: 20,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: 'mask-user-input',
      // Specify URLs to propagate trace headers for connection between RUM and backend trace
      allowedTracingUrls: [
        {
          match: 'https://api-gateway.central.jesusfilm.org/',
          propagatorTypes: ['tracecontext']
        },
        {
          match: 'https://api-gateway.stage.central.jesusfilm.org/',
          propagatorTypes: ['tracecontext']
        }
      ]
    })
  }

  // Render nothing - this component is only included so that the init code
  // above will run client-side
  return null
}
