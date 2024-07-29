import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { useFlags } from '@core/shared/ui/FlagsProvider'
import { AnalyticsItem } from './AnalyticsItem'
import { CommandRedoItem } from './CommandRedoItem'
import { CommandUndoItem } from './CommandUndoItem'
import { PreviewItem } from './PreviewItem'
import { ResponsesItem } from './ResponsesItem'
import { ShareItem } from './ShareItem'
import { StrategyItem } from './StrategyItem'

export function Items(): ReactElement {
  const { commands } = useFlags()
  return (
    <Stack
      sx={{ display: { xs: 'none', sm: 'flex' } }}
      flexDirection="row"
      gap={5}
      data-testid="ItemsStack"
    >
      {commands && (
        <>
          <CommandUndoItem variant="icon-button" />
          <CommandRedoItem variant="icon-button" />
        </>
      )}
      <ResponsesItem variant="button" />
      <AnalyticsItem variant="icon-button" />
      <StrategyItem variant="button" />
      <ShareItem variant="button" />
      <PreviewItem variant="icon-button" />
    </Stack>
  )
}
