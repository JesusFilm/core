import { ReactElement } from 'react'

interface BackgroundColorProps {
  id: string
  backgroundColor: string | null
}

export function BackgroundColor({
  id,
  backgroundColor
}: BackgroundColorProps): ReactElement {
  return <>{id} BackgroundColor</>
}
