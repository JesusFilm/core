import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import EditIcon from '@mui/icons-material/Edit'
import TranslateIcon from '@mui/icons-material/Translate'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'react-i18next'
import { AccessAvatars } from '../../../AccessAvatars'
import { StatusChip } from '../StatusChip'
import {
  GetJourneys_journeys as Journey,
  GetJourneys_journeys_userJourneys as UserJourney
} from '../../../../../__generated__/GetJourneys'
import { JourneyCardVariant } from '..'
import { UserJourneyRole } from '../../../../../__generated__/globalTypes'

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
                  color: (theme) => theme.palette.warning.main,
                  fontWeight: 700,
                  minWidth: '48px'
                }}
              >
                {usersRequestingAccess}
              </Typography>
              <Typography variant="body2" noWrap>
                {t(`\u00A0requested editing rights for your journey`)}
              </Typography>
            </Stack>
          ) : (
            <>
              <Skeleton variant="text" width={60} />
            </>
          )}
        </>
      ) : (
        <>
          {journey != null ? (
            <StatusChip status={journey.status} />
          ) : (
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <EditIcon sx={{ fontSize: 13 }} />
              <Typography variant="caption">
                <Skeleton variant="text" width={30} />
              </Typography>
            </Stack>
          )}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <TranslateIcon sx={{ fontSize: 13 }} />
            <Typography variant="caption">
              {journey != null ? (
                journey.language.name.find(({ primary }) => primary)?.value
              ) : (
                <Skeleton variant="text" width={40} />
              )}
            </Typography>
          </Stack>
        </>
      )}
    </Stack>
  )
}
