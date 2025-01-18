import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import {} from 'formik'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import { BlockFields_SpacerBlock } from '../../../../../../../../../../__generated__/BlockFields'

export const SPACER_SPACING_UPDATE = gql`
  mutation TextResponseLabelUpdate($id: ID!, $label: String!) {
    textResponseBlockUpdate(id: $id, input: { label: $label }) {
      id
      label
    }
  }
`

export function SpacerSpacing(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  // const [textResponseLabelUpdate] = useMutation<
  //   TextResponseLabelUpdate,
  //   TextResponseLabelUpdateVariables
  // >(SPACER_SPACING_UPDATE)
  const { state, dispatch } = useEditor()
  const {
    add,
    state: { undo }
  } = useCommand()

  const selectedBlock = state.selectedBlock as
    | TreeBlock<BlockFields_SpacerBlock>
    | undefined
  const [value, setValue] = useState(selectedBlock?.spacing ?? '')
  const [commandInput, setCommandInput] = useState({ id: uuidv4(), value })

  useEffect(() => {
    if (undo == null || undo.id === commandInput.id) return
    resetCommandInput()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undo?.id])

  useEffect(() => {
    setValue(selectedBlock?.spacing ?? '')
  }, [selectedBlock?.spacing])

  function resetCommandInput(): void {
    setCommandInput({ id: uuidv4(), value })
  }

  return (
    <Stack data-testid="SpacerFields">
      <Box sx={{ p: 4, pt: 0 }} data-testid="Label">
        <Slider sx={{ width: '100%' }} />
      </Box>
    </Stack>
  )
}
