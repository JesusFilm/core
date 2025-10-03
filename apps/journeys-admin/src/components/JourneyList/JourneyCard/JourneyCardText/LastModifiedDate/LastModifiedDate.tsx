import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { differenceInSeconds } from 'date-fns'
import { Trans, useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

interface LastModifiedDateProps {
  modifiedDate: string
}

const MINUTE_SECONDS = 60
const HOUR_SECONDS = MINUTE_SECONDS * 60
const DAY_SECONDS = HOUR_SECONDS * 24
const MONTH_SECONDS = DAY_SECONDS * 30
const YEAR_SECONDS = DAY_SECONDS * 365

export function LastModifiedDate({
  modifiedDate
}: LastModifiedDateProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const md = useMediaQuery(`(min-width:1200px) and (max-width:1400px)`)
  const secondsDifference = differenceInSeconds(
    new Date(),
    new Date(modifiedDate)
  )

  let duration

  if (secondsDifference < MINUTE_SECONDS) {
    duration = t('Edited just now')
  } else if (secondsDifference < HOUR_SECONDS) {
    const minutes = Math.floor(secondsDifference / MINUTE_SECONDS)
    duration =
      minutes === 1
        ? t('1 minute ago')
        : t('{{count}} minutes ago', { count: minutes })
  } else if (secondsDifference < DAY_SECONDS) {
    const hours = Math.floor(secondsDifference / HOUR_SECONDS)
    duration =
      hours === 1 ? t('1 hour ago') : t('{{count}} hours ago', { count: hours })
  } else if (secondsDifference < MONTH_SECONDS) {
    const days = Math.floor(secondsDifference / DAY_SECONDS)
    duration =
      days === 1 ? t('1 day ago') : t('{{count}} days ago', { count: days })
  } else if (secondsDifference < YEAR_SECONDS) {
    const months = Math.floor(secondsDifference / MONTH_SECONDS)
    duration =
      months === 1
        ? t('1 month ago')
        : t('{{count}} months ago', { count: months })
  } else {
    const years = Math.floor(secondsDifference / YEAR_SECONDS)
    duration =
      years === 1 ? t('1 year ago') : t('{{count}} years ago', { count: years })
  }

  return (
    <Trans t={t} duration={duration}>
      <Typography component="span" variant={md ? 'caption' : 'body2'}>
        {duration}
      </Typography>
    </Trans>
  )
}
