import { Box, Text } from 'ink'
import type { ReactElement } from 'react'

import type { EnvironmentConfig } from '../../config/environments'

import { Spinner } from './Spinner'

interface LoginProgressProps {
  env: EnvironmentConfig
  error: string | null
}

export function LoginProgress({ env, error }: LoginProgressProps): ReactElement {
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
        <Spinner />
        <Text> Signing in to {env.label}…</Text>
      </Box>
      <Text color="gray">Complete the sign-in in your browser.</Text>
    </Box>
  )
}
