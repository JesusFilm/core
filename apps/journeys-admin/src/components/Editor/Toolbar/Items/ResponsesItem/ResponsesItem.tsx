import { useQuery } from '@apollo/client'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Inbox2Icon from '@core/shared/ui/icons/Inbox2'

import { GetJourneyVisitorsCount } from '../../../../../../__generated__/GetJourneyVisitorsCount'
import { GET_JOURNEY_VISITORS_COUNT } from '../../../../../../pages/journeys/[journeyId]/reports/visitors'
import { Item } from '../Item/Item'

export function ResponsesItem(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const router = useRouter()
  const journeyId = router.query.journeyId as string

  const { data } = useQuery<GetJourneyVisitorsCount>(
    GET_JOURNEY_VISITORS_COUNT,
    {
      variables: {
        filter: { journeyId, hasTextResponse: true }
      }
    }
  )

  return (
    <Stack direction="row" alignItems="center" data-testid="ResponsesItem">
      <NextLink
        href={`/journeys/${journey?.id}/reports/visitors?withSubmittedText=true`}
        passHref
        legacyBehavior
        prefetch={false}
      >
        <Item
          variant="icon-button"
          label={t('Responses')}
          icon={<Inbox2Icon />}
        />
      </NextLink>
      <Typography variant="body2" sx={{ fontWeight: '600' }}>
        {data?.journeyVisitorCount ?? ''}
      </Typography>
    </Stack>
  )
}
