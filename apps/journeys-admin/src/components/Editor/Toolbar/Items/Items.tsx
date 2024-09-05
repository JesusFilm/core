import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { AnalyticsItem } from './AnalyticsItem'
import { PreviewItem } from './PreviewItem'
import { ShareItem } from './ShareItem'
import { StrategyItem } from './StrategyItem'
import { ResponsesItem } from './ResponsesItem'

export function Items(): ReactElement {
  return (
    <Stack
      sx={{ display: { xs: 'none', sm: 'flex' } }}
      flexDirection="row"
      gap={5}
      data-testid="ItemsStack"
      alignItems="center"
    >
      <ResponsesItem variant="icon-button" />
      <AnalyticsItem variant="icon-button" />
      <StrategyItem variant="button" />
      <ShareItem variant="button" />
      <PreviewItem variant="icon-button" />
    </Stack>
  )
}
