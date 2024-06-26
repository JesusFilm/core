import { useEditor } from '@core/journeys/ui/EditorProvider'
import { TreeBlock } from '@core/journeys/ui/block'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../__generated__/BlockFields'
import { TextResponseType } from '../../../../../../../../../../../__generated__/globalTypes'
import { Integrations } from './Integrations'
import { Route } from './Route'

export function GrowthSpacesIntegrations(): ReactElement {
  const { state } = useEditor()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<TextResponseBlock>
    | undefined

  return (
    <>
      {selectedBlock?.type === TextResponseType.email && (
        <Stack gap={4} sx={{ p: 4, pt: 0 }}>
          <Integrations />
          <Route />
        </Stack>
      )}
    </>
  )
}
