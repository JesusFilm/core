import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import {} from 'formik'
import { ReactElement, useEffect, useState } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import { BlockFields_SpacerBlock } from '../../../../../../../../../../__generated__/BlockFields'

export function SpacerSpacing(): ReactElement {
  const { state } = useEditor()

  const selectedBlock = state.selectedBlock as
    | TreeBlock<BlockFields_SpacerBlock>
    | undefined
  const [value, setValue] = useState(selectedBlock?.spacing ?? '')

  useEffect(() => {
    setValue(selectedBlock?.spacing ?? '')
  }, [selectedBlock?.spacing])

  return (
    <Stack data-testid="SpacerFields">
      <Box sx={{ p: 4, pt: 0 }} data-testid="Label">
        <Slider sx={{ width: '100%' }} />
      </Box>
    </Stack>
  )
}
