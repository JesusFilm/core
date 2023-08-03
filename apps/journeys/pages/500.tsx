import { ReactElement } from 'react'
import { transformer } from '@core/journeys/ui/transformer'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { useTranslation } from 'react-i18next'
import { Conductor } from '../src/components/Conductor'
import { ThemeName, ThemeMode } from '../__generated__/globalTypes'
import { getErrorJourneyBlocks } from '../libs/getErrorJourneyBlocks'

export function Custom500(): ReactElement {
  const { t } = useTranslation('apps-journeys')
  const blocks = getErrorJourneyBlocks(
    t('500'),
    t('Oops! Something went wrong.')
  )
  return (
    <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.dark}>
      <Conductor blocks={transformer(blocks)} />
    </ThemeProvider>
  )
}

export default Custom500
