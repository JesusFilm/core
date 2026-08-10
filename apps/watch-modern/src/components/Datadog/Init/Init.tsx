'use client'

import { datadogRum } from '@datadog/browser-rum'
import { reactPlugin } from '@datadog/browser-rum-react'
import { useEffect, useRef } from 'react'

import { env } from '@/env'

export default function DatadogInit(): null {
  const isInitialized = useRef(false)

  useEffect(() => {
    if (
      !isInitialized.current &&
      env.NEXT_PUBLIC_DATADOG_APPLICATION_ID &&
      env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN
    ) {
      try {
        datadogRum.init({
          applicationId: env.NEXT_PUBLIC_DATADOG_APPLICATION_ID,
          clientToken: env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
          site: env.NEXT_PUBLIC_DATADOG_SITE,
          service: 'watch-modern',
          env: env.NEXT_PUBLIC_DATADOG_ENV,
          version: env.NEXT_PUBLIC_DATADOG_VERSION,
          sessionSampleRate: 50,
          sessionReplaySampleRate: 10,
          trackUserInteractions: true,
          trackResources: true,
          trackLongTasks: true,
          defaultPrivacyLevel: 'mask-user-input',
          // Browser SDK v7 turns this on by default, which would start sending
          // user and account IDs to the gateway in a plaintext baggage header.
          // Opt out until that propagation is deliberately reviewed.
          propagateTraceBaggage: false,
          allowedTracingUrls: [
            {
              match: 'https://api-gateway.central.jesusfilm.org/',
              propagatorTypes: ['tracecontext']
            },
            {
              match: 'https://api-gateway.stage.central.jesusfilm.org/',
              propagatorTypes: ['tracecontext']
            }
          ],
          plugins: [reactPlugin()]
        })

        isInitialized.current = true
      } catch (error) {
        console.error('Failed to initialize Datadog RUM:', error)
      }
    }
  }, [])

  return null
}
