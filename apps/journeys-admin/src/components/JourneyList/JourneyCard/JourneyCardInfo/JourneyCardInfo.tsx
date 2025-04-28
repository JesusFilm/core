import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import {
  GetAdminJourneys_journeys as Journey,
  GetAdminJourneys_journeys_userJourneys as UserJourney
} from '../../../../../__generated__/GetAdminJourneys'
import { UserJourneyRole } from '../../../../../__generated__/globalTypes'
import { AccessAvatars } from '../../../AccessAvatars'
import { AnalyticsItem } from '../../../Editor/Toolbar/Items/AnalyticsItem'
import { ResponsesItem } from '../../../Editor/Toolbar/Items/ResponsesItem'
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

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      flexGrow={1}
      sx={{ width: '100%' }}
      data-testid="JourneyCardInfo"
    >
      <Stack flexDirection="row">
        <AnalyticsItem variant="icon-button" />
        <ResponsesItem variant="icon-button" />
      </Stack>
      <AccessAvatars
        journeyId={journey.id}
        userJourneys={inviteRequested ?? journey.userJourneys ?? undefined}
      />
      {variant === JourneyCardVariant.actionRequired ? (
        <Skeleton variant="text" width={60} />
      ) : null}
    </Stack>
  )
}
