import { Text } from 'ink'
import { type ReactElement, useEffect, useState } from 'react'

interface SpinnerProps {
  color?: string
  intervalMs?: number
}

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

/**
 * Tiny Braille spinner. Owns its own timer so consumers don't have to thread
 * frame state through props — drop it in wherever you want movement.
 */
export function Spinner({
  color = 'cyan',
  intervalMs = 80
}: SpinnerProps): ReactElement {
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    const handle = setInterval(
      () => setFrame((f) => (f + 1) % FRAMES.length),
      intervalMs
    )
    return () => clearInterval(handle)
  }, [intervalMs])
  return <Text color={color}>{FRAMES[frame]}</Text>
}
