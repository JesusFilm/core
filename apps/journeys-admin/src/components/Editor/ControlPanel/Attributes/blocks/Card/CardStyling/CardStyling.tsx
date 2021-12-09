import { ThemeMode } from '../../../../../../../../__generated__/globalTypes'
import { ReactElement } from 'react'

interface CardStylingProps {
  id: string
  themeMode: ThemeMode | null
}

export function CardStyling({ id, themeMode }: CardStylingProps): ReactElement {
  return <>{id} CardStyling</>
}
