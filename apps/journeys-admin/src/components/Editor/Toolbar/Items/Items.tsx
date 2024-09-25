import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { AnalyticsItem } from './AnalyticsItem'
import { BackgroundUploadsItem } from './BackgroundUploads'
import { PreviewItem } from './PreviewItem'
import { ShareItem } from './ShareItem'
import { StrategyItem } from './StrategyItem'

export function Items(): ReactElement {
  return (
    <Stack
      sx={{ display: { xs: 'none', sm: 'flex' } }}
      flexDirection="row"
      gap={5}
      data-testid="ItemsStack"
      alignItems="center"
    >
      <BackgroundUploadsItem />
      <AnalyticsItem variant="icon-button" />
      <StrategyItem variant="button" />
      <ShareItem variant="button" />
      <PreviewItem variant="icon-button" />
    </Stack>
  )
}
