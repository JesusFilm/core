import type { RumInitConfiguration } from '@datadog/browser-rum'

export const DATADOG_RUM_SERVICE = 'watch'
export const DATADOG_TRACE_PROPAGATOR_TYPES = ['tracecontext'] as const

const DATADOG_ALLOWED_TRACING_ORIGINS = [
  'https://api-gateway.central.jesusfilm.org/',
  'https://api-gateway.stage.central.jesusfilm.org/'
] as const

const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
const URL_PATTERN = /https?:\/\/[^\s'"<>]+/gi

type DatadogBeforeSend = NonNullable<RumInitConfiguration['beforeSend']>
type DatadogRumEvent = Parameters<DatadogBeforeSend>[0] & {
  action?: {
    target?: {
      name?: string
    }
  }
  error?: {
    message?: string
    resource?: {
      url?: string
    }
    stack?: string
  }
  long_task?: {
    scripts?:
      | {
          invoker?: string
          source_url?: string
        }
      | Array<{
          invoker?: string
          source_url?: string
        }>
  }
  resource?: {
    url?: string
  }
  view?: {
    name?: string
    performance?: {
      lcp?: {
        resource_url?: string
      }
    }
    referrer?: string
    url?: string
  }
}

export interface DatadogRumEnv {
  applicationId?: string | undefined
  clientToken?: string | undefined
  env?: string | undefined
  site: RumInitConfiguration['site']
  version?: string | undefined
}

export const DATADOG_ALLOWED_TRACING_URLS = DATADOG_ALLOWED_TRACING_ORIGINS.map(
  (origin) => ({
    match: origin,
    propagatorTypes: [...DATADOG_TRACE_PROPAGATOR_TYPES]
  })
) satisfies NonNullable<RumInitConfiguration['allowedTracingUrls']>

function redactEmailLikeValues(value: string): string {
  return value.replace(EMAIL_PATTERN, '[REDACTED_EMAIL]')
}

export function redactSensitiveUrl(value: string): string {
  const redactedValue = redactEmailLikeValues(value)

  try {
    const url = new URL(redactedValue, 'https://www.jesusfilm.org')
    const pathOnly = `${url.pathname}${url.pathname.endsWith('/') ? '' : ''}`

    if (redactedValue.startsWith('/')) {
      return pathOnly
    }

    return `${url.origin}${pathOnly}`
  } catch {
    return redactedValue.replace(/\?[^#\s]*/g, '').replace(/#[^\s]*/g, '')
  }
}

export function redactSensitiveText(value: string): string {
  return redactEmailLikeValues(
    value.replace(URL_PATTERN, (url) => redactSensitiveUrl(url))
  )
}

function redactUrlField(
  container: { [key: string]: unknown } | undefined,
  key: string
): void {
  if (container == null) {
    return
  }

  const value = container?.[key]

  if (typeof value === 'string') {
    container[key] = redactSensitiveUrl(value)
  }
}

function redactTextField(
  container: { [key: string]: unknown } | undefined,
  key: string
): void {
  if (container == null) {
    return
  }

  const value = container?.[key]

  if (typeof value === 'string') {
    container[key] = redactSensitiveText(value)
  }
}

export function redactDatadogRumEvent(event: DatadogRumEvent): boolean {
  const redactedEvent = event

  redactUrlField(redactedEvent.view, 'url')
  redactUrlField(redactedEvent.view, 'referrer')
  redactTextField(redactedEvent.view, 'name')
  redactUrlField(redactedEvent.view?.performance?.lcp, 'resource_url')
  redactUrlField(redactedEvent.resource, 'url')
  redactUrlField(redactedEvent.error?.resource, 'url')
  redactTextField(redactedEvent.error, 'message')
  redactTextField(redactedEvent.error, 'stack')
  redactTextField(redactedEvent.action?.target, 'name')

  const scripts = redactedEvent.long_task?.scripts
  const scriptList = Array.isArray(scripts) ? scripts : scripts ? [scripts] : []

  for (const script of scriptList) {
    redactUrlField(script, 'source_url')
    redactTextField(script, 'invoker')
  }

  return true
}

export function isDatadogTracingAllowed(url: string): boolean {
  return DATADOG_ALLOWED_TRACING_ORIGINS.some((origin) =>
    url.startsWith(origin)
  )
}

export function buildDatadogRumConfig(
  datadogEnv: DatadogRumEnv,
  plugins: RumInitConfiguration['plugins'] = []
): RumInitConfiguration | undefined {
  if (!datadogEnv.applicationId || !datadogEnv.clientToken) {
    return undefined
  }

  return {
    applicationId: datadogEnv.applicationId,
    clientToken: datadogEnv.clientToken,
    site: datadogEnv.site,
    service: DATADOG_RUM_SERVICE,
    env: datadogEnv.env,
    version: datadogEnv.version,
    sessionSampleRate: 50,
    sessionReplaySampleRate: 10,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'mask-user-input',
    allowedTracingUrls: DATADOG_ALLOWED_TRACING_URLS,
    beforeSend: redactDatadogRumEvent as DatadogBeforeSend,
    plugins
  }
}
