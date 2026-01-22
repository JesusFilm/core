import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect } from 'react'

import Data1Icon from '@core/shared/ui/icons/Data1'
import EyeOpenIcon from '@core/shared/ui/icons/EyeOpen'
import Inbox2Icon from '@core/shared/ui/icons/Inbox2'

import { IdType } from '../../../../../__generated__/globalTypes'
import { useTemplateFamilyStatsAggregateLazyQuery } from '../../../../libs/useTemplateFamilyStatsAggregateLazyQuery'
import { Item } from '../../../Editor/Toolbar/Items/Item'

import { localizeAndRound } from './localizeAndRound'

interface TemplateAggregateAnalyticsProps {
  journeyId: string
}

export function TemplateAggregateAnalytics({
  journeyId
}: TemplateAggregateAnalyticsProps): ReactElement {
  const { t, i18n } = useTranslation('apps-journeys-admin')
  const locale = i18n?.language ?? 'en'
  const { enqueueSnackbar } = useSnackbar()
  const { query } = useTemplateFamilyStatsAggregateLazyQuery()
  const [getTemplateStats, { data, loading, error }] = query

  useEffect(() => {
    if (journeyId) {
      void getTemplateStats({
        variables: {
          id: journeyId,
          idType: IdType.databaseId,
          where: {}
        }
      })
    }
  }, [journeyId, getTemplateStats])

  useEffect(() => {
    if (error != null) {
      enqueueSnackbar(t('Failed to load template analytics'), {
        variant: 'error',
        preventDuplicate: true
      })
    }
  }, [error, enqueueSnackbar, t])

  const childJourneys = data?.templateFamilyStatsAggregate?.childJourneysCount
  const journeyViewCount =
    data?.templateFamilyStatsAggregate?.totalJourneysViews
  const journeyResponseCount =
    data?.templateFamilyStatsAggregate?.totalJourneysResponses
  const showLoadingSkeleton = loading || data == null

  const buttonProps = {
    sx: {
      px: '7px',
      py: 0,
      minWidth: '44px',
      cursor: 'default',
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
        label={t('Template uses')}
        count={
          showLoadingSkeleton ? (
            <Skeleton variant="text" width={18} height={21} />
          ) : (
            <Typography variant="subtitle3" sx={{ lineHeight: '21px' }}>
              {localizeAndRound(childJourneys, locale)}
            </Typography>
          )
        }
        ButtonProps={buttonProps}
      />
      <Item
        variant="icon-button"
        icon={<EyeOpenIcon />}
        label={t('Views')}
        count={
          showLoadingSkeleton ? (
            <Skeleton variant="text" width={18} height={21} />
          ) : (
            <Typography variant="subtitle3" sx={{ lineHeight: '21px' }}>
              {localizeAndRound(journeyViewCount, locale)}
            </Typography>
          )
        }
        ButtonProps={buttonProps}
      />
      <Item
        variant="icon-button"
        icon={<Inbox2Icon />}
        label={t('Responses')}
        count={
          showLoadingSkeleton ? (
            <Skeleton variant="text" width={18} height={21} />
          ) : (
            <Typography variant="subtitle3" sx={{ lineHeight: '21px' }}>
              {localizeAndRound(journeyResponseCount, locale)}
            </Typography>
          )
        }
        ButtonProps={buttonProps}
      />
    </Box>
  )
}
