import { ReactElement } from 'react'

interface ContentAppearanceProps {
  id: string
  fullscreen: boolean
}

export function ContentAppearance({
  id,
  fullscreen
}: ContentAppearanceProps): ReactElement {
  return <>{id} ContentAppearance</>
}
