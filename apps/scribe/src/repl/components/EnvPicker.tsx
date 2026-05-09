import { Box, Text, useInput } from 'ink'
import { type ReactElement, useState } from 'react'

import {
  type EnvironmentConfig,
  type EnvironmentId,
  listEnvironments
} from '../../config/environments'

interface EnvPickerProps {
  onSelect: (envId: EnvironmentId) => void
}

const ENV_COLORS: Record<EnvironmentId, string> = {
  dev: 'green',
  stage: 'yellow',
  prod: 'red'
}

export function EnvPicker({ onSelect }: EnvPickerProps): ReactElement {
  const envs = listEnvironments()
  const [index, setIndex] = useState(0)

  useInput((_input, key) => {
    if (key.upArrow) {
      setIndex((i) => (i - 1 + envs.length) % envs.length)
      return
    }
    if (key.downArrow) {
      setIndex((i) => (i + 1) % envs.length)
      return
    }
    if (key.return) {
      onSelect(envs[index].id)
    }
  })

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>scribe</Text>
        <Text color="gray"> — select an environment</Text>
      </Box>
      {envs.map((env, i) => (
        <EnvRow key={env.id} env={env} selected={i === index} />
      ))}
      <Box marginTop={1}>
        <Text color="gray">↑/↓ to move · Enter to select</Text>
      </Box>
    </Box>
  )
}

function EnvRow({
  env,
  selected
}: {
  env: EnvironmentConfig
  selected: boolean
}): ReactElement {
  const color = ENV_COLORS[env.id]
  return (
    <Box>
      <Text color={selected ? 'cyan' : 'gray'}>{selected ? '› ' : '  '}</Text>
      <Text bold color={color}>
        {env.id.toUpperCase()}
      </Text>
      <Text> </Text>
      <Text color="gray">{env.label}</Text>
    </Box>
  )
}
