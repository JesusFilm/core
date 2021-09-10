import { ReactElement } from 'react'
import { ThemeProvider } from '@mui/material'
import { lightTheme } from '../../../../../../apps/journeys/src/libs/themes/default'

import { TreeBlock } from '../../../libs/transformer/transformer'
import { BlockRenderer } from '../../BlockRenderer'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../__generated__/GetJourney'

export function Step ({
  children
}: TreeBlock<StepBlock>): ReactElement {
  return (
    // Should be getting theme prop from Step
    <ThemeProvider theme={lightTheme}>
      {children?.map((block) => <BlockRenderer {...block} key={block.id} />)}
    </ThemeProvider>
  )
}
