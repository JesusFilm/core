import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import AlignCenterIcon from '@core/shared/ui/icons/AlignCenter'
import AlignLeftIcon from '@core/shared/ui/icons/AlignLeft'
import AlignRightIcon from '@core/shared/ui/icons/AlignRight'

import { BlockFields_TypographyBlock as TypographyBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { TypographyAlign } from '../../../../../../../../../../__generated__/globalTypes'
import { TypographyBlockUpdateAlign } from '../../../../../../../../../../__generated__/TypographyBlockUpdateAlign'
import { ToggleButtonGroup } from '../../../controls/ToggleButtonGroup'

export const TYPOGRAPHY_BLOCK_UPDATE_ALIGN = gql`
  mutation TypographyBlockUpdateAlign(
    $id: ID!
    $input: TypographyBlockUpdateInput!
  ) {
    typographyBlockUpdate(id: $id, input: $input) {
      id
      align
    }
  }
`

export function Align(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [typographyBlockUpdate] = useMutation<TypographyBlockUpdateAlign>(
    TYPOGRAPHY_BLOCK_UPDATE_ALIGN
  )
  const { add } = useCommand()
  const {
    state: { selectedBlock: stateSelectedBlock, selectedStep },
    dispatch
  } = useEditor()
  const selectedBlock = stateSelectedBlock as
    | TreeBlock<TypographyBlock>
    | undefined

  async function handleChange(align: TypographyAlign): Promise<void> {
    if (selectedBlock == null || align == null) return

    add({
      parameters: {
        execute: { align },
        undo: {
          align: selectedBlock.align
        }
      },
      execute({ align }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedStep,
          selectedBlock
        })
        void typographyBlockUpdate({
          variables: {
            id: selectedBlock.id,
            input: { align }
          },
          optimisticResponse: {
            typographyBlockUpdate: {
              id: selectedBlock.id,
              align,
              __typename: 'TypographyBlock'
            }
          }
        })
      }
    })
  }

  const options = [
    {
      value: TypographyAlign.left,
      label: t('Left'),
      icon: <AlignLeftIcon />
    },
    {
      value: TypographyAlign.center,
      label: t('Center'),
      icon: <AlignCenterIcon />
    },
    {
      value: TypographyAlign.right,
      label: t('Right'),
      icon: <AlignRightIcon />
    }
  ]

  return (
    <ToggleButtonGroup
      value={selectedBlock?.align ?? TypographyAlign.left}
      onChange={handleChange}
      options={options}
      testId="Align"
    />
  )
}
