import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ReactElement } from 'react'
import { transformer } from '@core/journeys/ui/transformer'
import { Conductor } from '../src/components/Conductor'
import { ThemeName, ThemeMode } from '../__generated__/globalTypes'
import { getErrorJourneyBlocks } from '../libs/getErrorJourneyBlocks'

export function Custom404(): ReactElement {
  const blocks = getErrorJourneyBlocks('404')
  return (
    <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.dark}>
      <Conductor blocks={transformer(blocks)} />
    </ThemeProvider>
  )
}

export default Custom404
