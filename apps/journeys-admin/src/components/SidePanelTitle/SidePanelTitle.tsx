import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { HelpScoutBeacon } from '../HelpScoutBeacon'

interface SidePanelTitleProps {
  name?: string
  email?: string
}

export function SidePanelTitle({
  name,
  email
}: SidePanelTitleProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const theme = useTheme()
  const mdUp = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true })

  return (
    <>
      <Typography variant="subtitle1">{t('Create a New Journey')}</Typography>
      {mdUp && (
        <HelpScoutBeacon userInfo={{ name: name ?? '', email: email ?? '' }} />
      )}
    </>
  )
}
