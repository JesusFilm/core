'use client'

import { datadogRum } from '@datadog/browser-rum'
import { reactPlugin } from '@datadog/browser-rum-react'
import { useEffect, useRef } from 'react'

import { buildDatadogRumConfig } from './config'

import { env } from '@/env'

export default function DatadogInit(): null {
  const isInitialized = useRef(false)

  useEffect(() => {
    if (isInitialized.current) {
      return
    }

    const rumConfig = buildDatadogRumConfig(
      {
        applicationId: env.NEXT_PUBLIC_DATADOG_APPLICATION_ID,
        clientToken: env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
        site: env.NEXT_PUBLIC_DATADOG_SITE,
        env: env.NEXT_PUBLIC_DATADOG_ENV,
        version: env.NEXT_PUBLIC_DATADOG_VERSION
      },
      [reactPlugin()]
    )

    if (rumConfig == null) {
      return
    }

    try {
      datadogRum.init(rumConfig)
      isInitialized.current = true
    } catch (error) {
      console.error('Failed to initialize Datadog RUM:', error)
    }
  }, [])

  return null
}
