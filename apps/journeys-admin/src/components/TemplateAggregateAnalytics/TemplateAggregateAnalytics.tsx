import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import Data1Icon from '@core/shared/ui/icons/Data1'
import EyeOpenIcon from '@core/shared/ui/icons/EyeOpen'
import Inbox2Icon from '@core/shared/ui/icons/Inbox2'

import { Item } from '../Editor/Toolbar/Items/Item'

import { localizeAndRound } from './localizeAndRound'

export function TemplateAggregateAnalytics(): ReactElement {
  const { t, i18n } = useTranslation('apps-journeys-admin')
  const locale = i18n?.language ?? 'en'

  const childJourneys = 152610
  const journeyViewCount = 812310
  const journeyResponseCount = 8788898

  const buttonProps = {
    sx: {
      px: 1.5,
      py: 0,
      fontSize: '14px',
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
        count={localizeAndRound(childJourneys, locale)}
        ButtonProps={buttonProps}
      />
      <Item
        variant="icon-button"
        icon={<EyeOpenIcon />}
        label={t('Views')}
        count={localizeAndRound(journeyViewCount, locale)}
        ButtonProps={buttonProps}
      />
      <Item
        variant="icon-button"
        icon={<Inbox2Icon />}
        label={t('Responses')}
        count={localizeAndRound(journeyResponseCount, locale)}
        ButtonProps={buttonProps}
      />
    </Box>
  )
}
