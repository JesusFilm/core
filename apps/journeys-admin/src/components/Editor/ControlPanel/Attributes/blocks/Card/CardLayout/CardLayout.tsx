import { ReactElement } from 'react'

interface CardLayoutProps {
  id: string
  fullscreen: boolean
}

export function CardLayout({ id, fullscreen }: CardLayoutProps): ReactElement {
  return <>{id} CardLayout</>
}
