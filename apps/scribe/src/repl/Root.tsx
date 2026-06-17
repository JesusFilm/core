import { type ReactElement, useEffect, useState } from 'react'

import type { ActiveSession } from '../auth/login'
import { ensureSession } from '../auth/login'
import { type EnvironmentId, getEnvironment } from '../config/environments'
import type { ProviderId } from '../config/providers'

import { App } from './App'
import { EnvPicker } from './components/EnvPicker'
import { LoginProgress } from './components/LoginProgress'

interface RootProps {
  initialEnvId?: EnvironmentId
  forceLogin?: boolean
  model?: string
  initialProvider: ProviderId
}

type Phase =
  | { kind: 'select-env' }
  | { kind: 'logging-in'; envId: EnvironmentId; error: string | null }
  | { kind: 'ready'; session: ActiveSession }

export function Root({
  initialEnvId,
  forceLogin = false,
  model,
  initialProvider
}: RootProps): ReactElement {
  const [phase, setPhase] = useState<Phase>(() =>
    initialEnvId != null
      ? { kind: 'logging-in', envId: initialEnvId, error: null }
      : { kind: 'select-env' }
  )

  useEffect(() => {
    if (phase.kind !== 'logging-in' || phase.error != null) return
    let cancelled = false
    const env = getEnvironment(phase.envId)

    async function signIn(): Promise<void> {
      try {
        const session = await ensureSession(env, { forceLogin })
        if (cancelled) return
        setPhase({ kind: 'ready', session })
      } catch (error) {
        if (cancelled) return
        setPhase((prev) =>
          prev.kind === 'logging-in'
            ? {
                ...prev,
                error: error instanceof Error ? error.message : String(error)
              }
            : prev
        )
      }
    }
    void signIn()
    return () => {
      cancelled = true
    }
    // forceLogin is captured at mount time on purpose — re-running this for
    // intra-Root state changes would re-launch the browser flow.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase.kind, phase.kind === 'logging-in' ? phase.envId : null])

  if (phase.kind === 'select-env') {
    return (
      <EnvPicker
        onSelect={(envId) =>
          setPhase({ kind: 'logging-in', envId, error: null })
        }
      />
    )
  }

  if (phase.kind === 'logging-in') {
    return (
      <LoginProgress env={getEnvironment(phase.envId)} error={phase.error} />
    )
  }

  return (
    <App
      initialSession={phase.session}
      initialProvider={initialProvider}
      model={model}
    />
  )
}
