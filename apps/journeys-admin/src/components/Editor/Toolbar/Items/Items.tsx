import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { AnalyticsItem } from './AnalyticsItem'
import { PreviewItem } from './PreviewItem'
import { ResponsesItem } from './ResponsesItem'
import { ShareItem } from './ShareItem'
import { StrategyItem } from './StrategyItem'

export function Items(): ReactElement {
  return (
    <Stack
      sx={{ display: { xs: 'none', md: 'flex' } }}
      flexDirection="row"
      gap={5}
      data-testid="ItemsStack"
      alignItems="center"
    >
      <ResponsesItem />
      <AnalyticsItem variant="icon-button" />
      <StrategyItem variant="button" />
      <ShareItem variant="button" />
    </Stack>
  )
}
