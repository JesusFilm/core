import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../__generated__/BlockFields'
import { TextResponseType } from '../../../../../../../../../../../__generated__/globalTypes'

import { App } from './App'
import { Route } from './Route'

export function GrowthSpacesIntegrations(): ReactElement {
  const { state } = useEditor()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<TextResponseBlock>
    | undefined

  return (
    <>
      {(selectedBlock?.type === TextResponseType.email ||
        selectedBlock?.type === TextResponseType.name) && (
        <Stack gap={4} sx={{ p: 4, pt: 0 }}>
          <App />
          <Route />
        </Stack>
      )}
    </>
  )
}
