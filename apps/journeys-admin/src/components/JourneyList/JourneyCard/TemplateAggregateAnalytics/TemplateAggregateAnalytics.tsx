import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import Data1Icon from '@core/shared/ui/icons/Data1'
import EyeOpenIcon from '@core/shared/ui/icons/EyeOpen'
import Inbox2Icon from '@core/shared/ui/icons/Inbox2'

import {
  GetTemplateFamilyStatsAggregate,
  GetTemplateFamilyStatsAggregateVariables
} from '../../../../../__generated__/GetTemplateFamilyStatsAggregate'
import { IdType } from '../../../../../__generated__/globalTypes'
import { Item } from '../../../Editor/Toolbar/Items/Item'

import { localizeAndRound } from './localizeAndRound'

export const GET_TEMPLATE_FAMILY_STATS_AGGREGATE = gql`
  query GetTemplateFamilyStatsAggregate(
    $id: ID!
    $idType: IdType
    $where: PlausibleStatsAggregateFilter!
  ) {
    templateFamilyStatsAggregate(id: $id, idType: $idType, where: $where) {
      childJourneysCount
      totalJourneysViews
      totalJourneysResponses
    }
  }
`

interface TemplateAggregateAnalyticsProps {
  journeyId: string
}

export function TemplateAggregateAnalytics({
  journeyId
}: TemplateAggregateAnalyticsProps): ReactElement {
  const { t, i18n } = useTranslation('apps-journeys-admin')
  const locale = i18n?.language ?? 'en'

  const { data } = useQuery<
    GetTemplateFamilyStatsAggregate,
    GetTemplateFamilyStatsAggregateVariables
  >(GET_TEMPLATE_FAMILY_STATS_AGGREGATE, {
    variables: {
      id: journeyId,
      idType: IdType.databaseId,
      where: {}
    },
    skip: !journeyId
  })

  const childJourneys = data?.templateFamilyStatsAggregate?.childJourneysCount
  const journeyViewCount =
    data?.templateFamilyStatsAggregate?.totalJourneysViews
  const journeyResponseCount =
    data?.templateFamilyStatsAggregate?.totalJourneysResponses

  const buttonProps = {
    sx: {
      px: '7px',
      py: 0,
      minWidth: '44px',
      '& > .MuiButton-startIcon > .MuiSvgIcon-root': {
        fontSize: '16px'
      },
      '& > .MuiButton-icon': {
        marginRight: '6px'
      }
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}
    >
      <Item
        variant="icon-button"
        icon={<Data1Icon />}
        label={t('Journeys Created')}
        count={
          <Typography variant="subtitle3" sx={{ lineHeight: '21px' }}>
            {localizeAndRound(childJourneys, locale)}
          </Typography>
        }
        ButtonProps={buttonProps}
      />
      <Item
        variant="icon-button"
        icon={<EyeOpenIcon />}
        label={t('Views')}
        count={
          <Typography variant="subtitle3" sx={{ lineHeight: '21px' }}>
            {localizeAndRound(journeyViewCount, locale)}
          </Typography>
        }
        ButtonProps={buttonProps}
      />
      <Item
        variant="icon-button"
        icon={<Inbox2Icon />}
        label={t('Responses')}
        count={
          <Typography variant="subtitle3" sx={{ lineHeight: '21px' }}>
            {localizeAndRound(journeyResponseCount, locale)}
          </Typography>
        }
        ButtonProps={buttonProps}
      />
    </Box>
  )
}
