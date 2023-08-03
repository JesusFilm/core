import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ReactElement } from 'react'
import { transformer } from '@core/journeys/ui/transformer'
import { useTranslation } from 'react-i18next'
import { Conductor } from '../src/components/Conductor'
import { ThemeName, ThemeMode } from '../__generated__/globalTypes'
import { getErrorJourneyBlocks } from '../libs/getErrorJourneyBlocks'

export function Custom404(): ReactElement {
  const { t } = useTranslation('apps-journeys')
  const blocks = getErrorJourneyBlocks(
    t('404'),
    t('This Journey is not available.')
  )
  return (
    <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.dark}>
      <Conductor blocks={transformer(blocks)} />
    </ThemeProvider>
  )
}

export default Custom404
