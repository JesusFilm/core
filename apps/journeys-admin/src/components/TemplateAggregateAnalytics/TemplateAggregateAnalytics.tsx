import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'
import { Item } from '../Editor/Toolbar/Items/Item'

import Data1Icon from '@core/shared/ui/icons/Data1'
import EyeOpenIcon from '@core/shared/ui/icons/EyeOpen'
import Inbox2Icon from '@core/shared/ui/icons/Inbox2'
import { useTranslation } from 'next-i18next'
import { localizeAndRound } from './localizeAndRound'

export function TemplateAggregateAnalytics(): ReactElement {
  const { t, i18n } = useTranslation('apps-journeys-admin')
  console.log('i18n?.language', i18n?.language)

  const locale = 'en'
  // const locale = i18n?.language ?? 'en'
  const childJourneys = 152600
  const journeyViewCount = 812310
  const journeyResponseCount = 8792342

  const buttonProps = {
    sx: {
      p: 1.5
    }
  }

  return (
    <Stack direction="row" gap={1} alignItems="center">
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
    </Stack>
  )
}
