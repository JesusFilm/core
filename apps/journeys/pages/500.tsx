import { ReactElement } from 'react'
import { transformer } from '@core/journeys/ui/transformer'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { Conductor } from '../src/components/Conductor'
import { ThemeName, ThemeMode } from '../__generated__/globalTypes'
import { getErrorJourneyBlocks } from '../libs/getErrorJourneyBlocks'

export function Custom500(): ReactElement {
  const blocks = getErrorJourneyBlocks('500')
  return (
    <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.dark}>
      <Conductor blocks={transformer(blocks)} />
    </ThemeProvider>
  )
}

export default Custom500
