import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import SpaceHeight from '@core/shared/ui/icons/SpaceHeight'

import { BlockFields_SpacerBlock as SpacerBlock } from '../../../../../../../../../__generated__/BlockFields'
import {
  SpacerSpacingUpdate,
  SpacerSpacingUpdateVariables
} from '../../../../../../../../../__generated__/SpacerSpacingUpdate'
import { Accordion } from '../../Accordion'

const SPACER_SPACING_UPDATE = gql`
  mutation SpacerSpacingUpdate($id: ID!, $spacing: Int!) {
    spacerBlockUpdate(id: $id, input: { spacing: $spacing }) {
      id
      spacing
    }
  }
`

export function Spacer({ id, spacing }: TreeBlock<SpacerBlock>): ReactElement {
  const [spacerSpacingUpdate] = useMutation<
    SpacerSpacingUpdate,
    SpacerSpacingUpdateVariables
  >(SPACER_SPACING_UPDATE)
  const { t } = useTranslation('apps-journeys-admin')
  const { add } = useCommand()
  const { dispatch } = useEditor()
  const [value, setValue] = useState(spacing ?? 100)
  const { state } = useEditor()

  const selectedBlock = state.selectedBlock as
    | TreeBlock<SpacerBlock>
    | undefined

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      selectedAttributeId: `${id}-spacer-options`
    })
  }, [dispatch, id])

  function handleChange(_event, spacing: number): void {
    setValue(spacing)
  }

  function handleSpacingChange(_event, spacing: number): void {
    if (selectedBlock == null) return
    add({
      parameters: {
        execute: { spacing },
        undo: { spacing: selectedBlock?.spacing }
      },
      execute({ spacing }) {
        void spacerSpacingUpdate({
          variables: {
            id: selectedBlock.id,
            spacing
          },
          optimisticResponse: {
            spacerBlockUpdate: {
              id: selectedBlock.id,
              spacing,
              __typename: 'SpacerBlock'
            }
          }
        }).then(() => {
          setValue(spacing)
        })
      }
    })
  }

  return (
    <Box data-testid="SpacerProperties">
      <Accordion
        id={`${id}-spacer-options`}
        icon={<SpaceHeight />}
        name={t('Spacer Height')}
        value={t('{{units}} Units', { units: value })}
      >
        <Stack data-testid="SpacerFields">
          <Typography variant="caption" sx={{ mx: 4 }}>
            {t('Spacer will appear invisible to journey viewers')}
          </Typography>
          <Box sx={{ p: 4, pt: 0 }} data-testid="Label">
            <Slider
              sx={{ width: '100%' }}
              min={20}
              max={400}
              step={10}
              value={value}
              onChange={handleChange}
              onChangeCommitted={handleSpacingChange}
            />
          </Box>
        </Stack>
      </Accordion>
    </Box>
  )
}
