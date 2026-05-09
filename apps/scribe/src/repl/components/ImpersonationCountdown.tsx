import { Text } from 'ink'
import { type ReactElement, useEffect, useState } from 'react'

interface ImpersonationCountdownProps {
  expiresAt: number
}

/**
 * Owns its own per-second timer so the banner can re-render without dragging
 * the rest of the StatusBar tree along. When the token has expired the label
 * shifts to a clear "EXPIRED" state — the agent's calls will start failing
 * with UNAUTHENTICATED at that point and the user is expected to
 * /stop-impersonate (and re-impersonate if needed). No automatic refresh.
 */
export function ImpersonationCountdown({
  expiresAt
}: ImpersonationCountdownProps): ReactElement {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const handle = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(handle)
  }, [])

  const remainingMs = expiresAt - now
  if (remainingMs <= 0) {
    return (
      <Text color="white" bold>
        EXPIRED — /stop-impersonate to clear
      </Text>
    )
  }

  const totalSeconds = Math.floor(remainingMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const label =
    minutes > 0
      ? `${minutes}m ${seconds.toString().padStart(2, '0')}s left`
      : `${seconds}s left`

  return (
    <Text color="white" bold={remainingMs < 5 * 60 * 1000}>
      {label}
    </Text>
  )
}
