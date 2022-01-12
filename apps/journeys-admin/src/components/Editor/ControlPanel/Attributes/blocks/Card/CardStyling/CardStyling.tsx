import { ReactElement } from 'react'
import { ThemeMode } from '../../../../../../../../__generated__/globalTypes'

interface CardStylingProps {
  id: string
  themeMode: ThemeMode | null
}

export function CardStyling({ id, themeMode }: CardStylingProps): ReactElement {
  return <>{id} CardStyling</>
}
