import TranslateIcon from '@mui/icons-material/Translate'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import {
  GetAdminJourneys_journeys as Journey,
  GetAdminJourneys_journeys_userJourneys as UserJourney
} from '../../../../../__generated__/GetAdminJourneys'
import { UserJourneyRole } from '../../../../../__generated__/globalTypes'
import { AccessAvatars } from '../../../AccessAvatars'
import { JourneyCardVariant } from '../journeyCardVariant'

interface Props {
  journey?: Journey
  variant: JourneyCardVariant
}

export function JourneyCardInfo({ journey, variant }: Props): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  let inviteRequested: UserJourney[] | undefined
  if (
    variant === JourneyCardVariant.actionRequired &&
    journey?.userJourneys != null
  ) {
    inviteRequested = journey.userJourneys.filter(
      (uj) => uj.role === UserJourneyRole.inviteRequested
    )
  }
  const usersRequestingAccess =
    inviteRequested != null
      ? inviteRequested.length === 1
        ? `${inviteRequested.length} ${t('user')}`
        : `${inviteRequested.length} ${t('users')}`
      : ''

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={4}
      flexGrow={1}
      sx={{ width: '95%' }}
    >
      <AccessAvatars
        journeyId={journey?.id}
        userJourneys={inviteRequested ?? journey?.userJourneys ?? undefined}
      />
      {variant === JourneyCardVariant.actionRequired ? (
        <>
          {inviteRequested != null ? (
            <Stack direction="row" sx={{ width: '70%' }}>
              <Typography
                variant="body2"
                sx={{
                  color: 'warning.main',
                  fontWeight: 700,
                  minWidth: '56px'
                }}
              >
                {usersRequestingAccess}
              </Typography>
              <Typography variant="body2" noWrap>
                {t(`requested editing rights for your journey`)}
              </Typography>
            </Stack>
          ) : (
            <Skeleton variant="text" width={60} />
          )}
        </>
      ) : (
        <>
          {journey != null ? (
            <>
              {/* <StatusChip status={journey.status} /> */}
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <TranslateIcon sx={{ fontSize: 13 }} />
                <Typography variant="caption">
                  {journey.language.name.find(({ primary }) => primary)?.value}
                </Typography>
              </Stack>
            </>
          ) : (
            <>
              <Skeleton variant="text" width={40} />
            </>
          )}
        </>
      )}
    </Stack>
  )
}
