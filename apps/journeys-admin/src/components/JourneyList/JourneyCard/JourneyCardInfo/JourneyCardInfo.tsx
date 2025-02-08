import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { intlFormat, isThisYear, parseISO } from 'date-fns'
import { Trans, useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import Calendar2Icon from '@core/shared/ui/icons/Calendar2'
import Globe1Icon from '@core/shared/ui/icons/Globe1'

import {
  GetAdminJourneys_journeys as Journey,
  GetAdminJourneys_journeys_userJourneys as UserJourney
} from '../../../../../__generated__/GetAdminJourneys'
import { UserJourneyRole } from '../../../../../__generated__/globalTypes'
import { AccessAvatars } from '../../../AccessAvatars'
import { JourneyCardVariant } from '../journeyCardVariant'

interface JourneyCardInfoProps {
  journey: Journey
  variant: JourneyCardVariant
}

export function JourneyCardInfo({
  journey,
  variant
}: JourneyCardInfoProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  let inviteRequested: UserJourney[] | undefined
  if (
    variant === JourneyCardVariant.actionRequired &&
    journey.userJourneys != null
  ) {
    inviteRequested = journey.userJourneys.filter(
      (uj) => uj.role === UserJourneyRole.inviteRequested
    )
  }
  const usersRequestingAccess =
    inviteRequested != null
      ? inviteRequested.length === 1
        ? t('1 user')
        : t('{{ numberOfUsers }} users', {
            numberOfUsers: inviteRequested.length
          })
      : ''

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={4}
      flexGrow={1}
      sx={{ width: '95%' }}
      data-testid="JourneyCardInfo"
    >
      <AccessAvatars
        journeyId={journey.id}
        userJourneys={inviteRequested ?? journey.userJourneys ?? undefined}
      />
      {variant === JourneyCardVariant.actionRequired ? (
        <>
          {inviteRequested != null ? (
            <Stack direction="row" sx={{ width: '70%' }}>
              <Trans t={t} usersRequestingAccess={usersRequestingAccess}>
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
                  requested editing rights for your journey
                </Typography>
              </Trans>
            </Stack>
          ) : (
            <Skeleton variant="text" width={60} />
          )}
        </>
      ) : (
        <Stack direction="row" alignItems="center" spacing={2}>
          <Globe1Icon sx={{ fontSize: 13 }} />
          <Typography variant="caption">
            {journey.language.name.find(({ primary }) => primary)?.value}
          </Typography>
          <Calendar2Icon sx={{ fontSize: 13 }} />
          <Typography
            variant="caption"
            noWrap
            sx={{
              display: 'block',
              color: 'secondary.main'
            }}
            suppressHydrationWarning
          >
            {intlFormat(parseISO(journey.createdAt as string), {
              day: 'numeric',
              month: 'long',
              year: isThisYear(parseISO(String(journey.createdAt)))
                ? undefined
                : 'numeric'
            })}
          </Typography>
        </Stack>
      )}
    </Stack>
  )
}
