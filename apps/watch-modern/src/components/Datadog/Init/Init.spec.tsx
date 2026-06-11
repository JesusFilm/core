import { render, waitFor } from '@testing-library/react'
import { StrictMode } from 'react'

import DatadogInit from './Init'

const mocks = vi.hoisted(() => ({
  datadogInit: vi.fn(),
  env: {
    NEXT_PUBLIC_DATADOG_APPLICATION_ID: 'application-id',
    NEXT_PUBLIC_DATADOG_CLIENT_TOKEN: 'client-token',
    NEXT_PUBLIC_DATADOG_ENV: 'prod',
    NEXT_PUBLIC_DATADOG_SITE: 'datadoghq.com',
    NEXT_PUBLIC_DATADOG_VERSION: 'commit-sha'
  } as Record<string, string | undefined>,
  reactPlugin: vi.fn(() => ({ name: 'react-plugin' }))
}))

vi.mock('@datadog/browser-rum', () => ({
  datadogRum: {
    init: mocks.datadogInit
  }
}))

vi.mock('@datadog/browser-rum-react', () => ({
  reactPlugin: mocks.reactPlugin
}))

vi.mock('@/env', () => ({
  env: mocks.env
}))

describe('DatadogInit', () => {
  const baseEnv = { ...mocks.env }

  beforeEach(() => {
    Object.assign(mocks.env, baseEnv)
    mocks.datadogInit.mockReset()
    mocks.reactPlugin.mockClear()
  })

  it('initializes Datadog RUM once with the legacy Watch service config', async () => {
    render(
      <StrictMode>
        <DatadogInit />
      </StrictMode>
    )

    await waitFor(() => expect(mocks.datadogInit).toHaveBeenCalledTimes(1))
    expect(mocks.datadogInit).toHaveBeenCalledWith(
      expect.objectContaining({
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
        beforeSend: expect.any(Function),
        plugins: [{ name: 'react-plugin' }]
      })
    )
  })

  it('does not initialize Datadog RUM without required public credentials', () => {
    mocks.env['NEXT_PUBLIC_DATADOG_CLIENT_TOKEN'] = undefined

    render(<DatadogInit />)

    expect(mocks.datadogInit).not.toHaveBeenCalled()
  })

  it('catches Datadog initialization failures without breaking render', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    mocks.datadogInit.mockImplementationOnce(() => {
      throw new Error('Datadog unavailable')
    })

    render(<DatadogInit />)

    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to initialize Datadog RUM:',
        expect.any(Error)
      )
    )

    consoleError.mockRestore()
  })
})
