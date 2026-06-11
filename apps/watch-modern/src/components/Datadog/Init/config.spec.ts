import {
  buildDatadogRumConfig,
  isDatadogTracingAllowed,
  redactDatadogRumEvent,
  redactSensitiveText,
  redactSensitiveUrl
} from './config'

describe('buildDatadogRumConfig', () => {
  const datadogEnv = {
    applicationId: 'application-id',
    clientToken: 'client-token',
    site: 'datadoghq.com' as const,
    env: 'prod',
    version: 'commit-sha'
  }

  it('builds the legacy Watch RUM config', () => {
    const plugin = { name: 'react-plugin' }

    expect(buildDatadogRumConfig(datadogEnv, [plugin] as never)).toMatchObject({
      applicationId: 'application-id',
      clientToken: 'client-token',
      site: 'datadoghq.com',
      service: 'watch',
      env: 'prod',
      version: 'commit-sha',
      sessionSampleRate: 50,
      sessionReplaySampleRate: 10,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: 'mask-user-input',
      plugins: [plugin]
    })
  })

  it('skips initialization when Datadog credentials are missing', () => {
    expect(
      buildDatadogRumConfig({ ...datadogEnv, applicationId: undefined })
    ).toBeUndefined()
    expect(
      buildDatadogRumConfig({ ...datadogEnv, clientToken: undefined })
    ).toBeUndefined()
  })
})

describe('redactSensitiveUrl', () => {
  it('removes query strings, fragments, and email-like values from absolute URLs', () => {
    expect(
      redactSensitiveUrl(
        'https://www.jesusfilm.org/watch?email=person@example.com#player'
      )
    ).toBe('https://www.jesusfilm.org/watch')
  })

  it('preserves relative paths without query strings or fragments', () => {
    expect(
      redactSensitiveUrl('/watch/search?q=person@example.com#results')
    ).toBe('/watch/search')
  })
})

describe('redactSensitiveText', () => {
  it('redacts email-like values and URL query data inside text fields', () => {
    expect(
      redactSensitiveText(
        'Failed for person@example.com at https://example.com/watch?token=abc#frag'
      )
    ).toBe('Failed for [REDACTED_EMAIL] at https://example.com/watch')
  })
})

describe('redactDatadogRumEvent', () => {
  it('redacts mutable URL and string fields Datadog allows before send', () => {
    const event = {
      view: {
        url: 'https://www.jesusfilm.org/watch?email=person@example.com#player',
        referrer: 'https://referrer.example/?from=person@example.com',
        name: 'Watch person@example.com',
        performance: {
          lcp: {
            resource_url:
              'https://cdn.example/image.jpg?email=person@example.com'
          }
        }
      },
      resource: {
        url: 'https://api.example/videos?email=person@example.com'
      },
      error: {
        message:
          'Failed for person@example.com at https://example.com/watch?token=abc#frag',
        stack: 'Error for person@example.com',
        resource: {
          url: 'https://api.example/error?email=person@example.com#frag'
        }
      },
      action: {
        target: {
          name: 'Search person@example.com'
        }
      },
      long_task: {
        scripts: [
          {
            source_url:
              'https://static.example/app.js?email=person@example.com',
            invoker: 'invoke person@example.com'
          }
        ]
      }
    }

    expect(redactDatadogRumEvent(event as never)).toBe(true)
    const firstLongTaskScript = event.long_task.scripts[0]

    expect(event.view.url).toBe('https://www.jesusfilm.org/watch')
    expect(event.view.referrer).toBe('https://referrer.example/')
    expect(event.view.name).toBe('Watch [REDACTED_EMAIL]')
    expect(event.view.performance.lcp.resource_url).toBe(
      'https://cdn.example/image.jpg'
    )
    expect(event.resource.url).toBe('https://api.example/videos')
    expect(event.error.message).toBe(
      'Failed for [REDACTED_EMAIL] at https://example.com/watch'
    )
    expect(event.error.stack).toBe('Error for [REDACTED_EMAIL]')
    expect(event.error.resource.url).toBe('https://api.example/error')
    expect(event.action.target.name).toBe('Search [REDACTED_EMAIL]')
    expect(firstLongTaskScript?.source_url).toBe(
      'https://static.example/app.js'
    )
    expect(firstLongTaskScript?.invoker).toBe('invoke [REDACTED_EMAIL]')
  })
})

describe('isDatadogTracingAllowed', () => {
  it.each([
    'https://api-gateway.central.jesusfilm.org/graphql',
    'https://api-gateway.stage.central.jesusfilm.org/graphql'
  ])('allows trace propagation to gateway URL %s', (url) => {
    expect(isDatadogTracingAllowed(url)).toBe(true)
  })

  it.each([
    'https://stream.mux.com/video',
    'https://video-variants-prd.algolia.net/1/indexes',
    'https://browser-intake-datadoghq.com/api/v2/rum',
    'https://www.jesusfilm.org/watch/modern/_next/static/chunk.js',
    'https://example.com/graphql'
  ])('does not allow trace propagation to %s', (url) => {
    expect(isDatadogTracingAllowed(url)).toBe(false)
  })
})
