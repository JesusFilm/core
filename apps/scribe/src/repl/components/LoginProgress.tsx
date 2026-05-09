import { Box, Text } from 'ink'
import { type ReactElement, useEffect, useState } from 'react'

import type { EnvironmentConfig } from '../../config/environments'

interface LoginProgressProps {
  env: EnvironmentConfig
  error: string | null
}

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

export function LoginProgress({ env, error }: LoginProgressProps): ReactElement {
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    if (error != null) return
    const interval = setInterval(
      () => setFrame((f) => (f + 1) % SPINNER_FRAMES.length),
      80
    )
    return () => clearInterval(interval)
  }, [error])

  if (error != null) {
    return (
      <Box flexDirection="column">
        <Text color="red">Sign-in to {env.label} failed:</Text>
        <Text>{error}</Text>
        <Text color="gray">Press Ctrl-C to exit and try again.</Text>
      </Box>
    )
  }

  return (
    <Box flexDirection="column">
      <Box>
        <Text color="cyan">{SPINNER_FRAMES[frame]} </Text>
        <Text>Signing in to {env.label}…</Text>
      </Box>
      <Text color="gray">Complete the sign-in in your browser.</Text>
    </Box>
  )
}
