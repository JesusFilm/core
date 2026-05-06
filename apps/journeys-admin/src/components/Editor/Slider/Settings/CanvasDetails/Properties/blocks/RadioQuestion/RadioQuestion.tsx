import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { RADIO_QUESTION_FIELDS } from '@core/journeys/ui/RadioQuestion/radioQuestionFields'
import LineNumbers from '@core/shared/ui/icons/LineNumbers'

import { BlockFields_RadioQuestionBlock as RadioQuestionBlock } from '../../../../../../../../../__generated__/BlockFields'
import {
  RadioQuestionUpdate,
  RadioQuestionUpdateVariables
} from '../../../../../../../../../__generated__/RadioQuestionUpdate'
import { Accordion } from '../../Accordion'
import { ToggleButtonGroup } from '../../controls/ToggleButtonGroup'

export const RADIO_QUESTION_UPDATE = gql`
  ${RADIO_QUESTION_FIELDS}
  mutation RadioQuestionUpdate(
    $id: ID!
    $parentBlockId: ID!
    $gridView: Boolean
  ) {
    radioQuestionBlockUpdate(
      id: $id
      parentBlockId: $parentBlockId
      gridView: $gridView
    ) {
      ...RadioQuestionFields
    }
  }
`

export function RadioQuestion({
  id,
  parentBlockId,
  gridView,
  parentOrder
}: TreeBlock<RadioQuestionBlock>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { selectedBlockId, selectedBlock, selectedStep },
    dispatch
  } = useEditor()
  const { add } = useCommand()

  const pollVariant = gridView ? 'text-and-image' : 'text-only'

  const [radioQuestionUpdate] = useMutation<
    RadioQuestionUpdate,
    RadioQuestionUpdateVariables
  >(RADIO_QUESTION_UPDATE)

  const options = [
    {
      value: 'text-only',
      label: t('Text Only')
    },
    {
      value: 'text-and-image',
      label: t('Text and Image')
    }
  ]

  async function handlePollVariantChange(value: string): Promise<void> {
    if (parentBlockId == null) return
    const newGridView = value === 'text-and-image'
    add({
      parameters: {
        execute: { gridView: newGridView },
        undo: {
          gridView: (selectedBlock as TreeBlock<RadioQuestionBlock>)?.gridView
        }
      },
      execute({ gridView }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlock,
          selectedStep: selectedStep,
          selectedAttributeId: `PollVariants-${selectedBlockId}`
        })
        void radioQuestionUpdate({
          variables: {
            id,
            parentBlockId,
            gridView
          },
          optimisticResponse: {
            radioQuestionBlockUpdate: {
              id,
              parentBlockId,
              parentOrder,
              gridView,
              __typename: 'RadioQuestionBlock'
            }
          }
        })
      }
    })
  }

  return (
    <Box data-testid="RadioQuestionProperties">
      <Box sx={{ p: 4 }}>
        <Typography>
          {t('To edit poll content, choose each option individually.')}
        </Typography>
      </Box>
      <Accordion
        id={`PollVariants-${selectedBlockId}`}
        icon={<LineNumbers />}
        name={t('Poll Variants')}
        value={
          pollVariant === 'text-and-image'
            ? t('Text and Image')
            : t('Text Only')
        }
      >
        <ToggleButtonGroup
          options={options}
          value={pollVariant}
          onChange={handlePollVariantChange}
        />
      </Accordion>
    </Box>
  )
}
