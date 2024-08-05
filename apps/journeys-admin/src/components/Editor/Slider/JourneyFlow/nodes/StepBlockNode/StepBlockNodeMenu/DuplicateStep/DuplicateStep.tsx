import { gql, useMutation } from '@apollo/client'
import last from 'lodash/last'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'
import CopyLeftIcon from '@core/shared/ui/icons/CopyLeft'

import {
  BlockFields,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../../../__generated__/BlockFields'
import { StepDuplicate } from '../../../../../../../../../__generated__/StepDuplicate'
import { MenuItem } from '../../../../../../../MenuItem'
import { STEP_NODE_DUPLICATE_OFFSET } from '../../libs/sizes'

interface DuplicateStepProps {
  step: TreeBlock<StepBlock>
  xPos?: number
  yPos?: number
  handleClick?: () => void
  disabled?: boolean
}

export const STEP_DUPLICATE = gql`
  mutation StepDuplicate(
    $id: ID!
    $journeyId: ID!
    $parentOrder: Int
    $x: Int
    $y: Int
  ) {
    blockDuplicate(
      id: $id
      journeyId: $journeyId
      parentOrder: $parentOrder
      x: $x
      y: $y
    ) {
      id
    }
  }
`

export function DuplicateStep({
  step,
  xPos,
  yPos,
  handleClick,
  disabled
}: DuplicateStepProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { dispatch } = useEditor()
  const [stepDuplicate] = useMutation<StepDuplicate>(STEP_DUPLICATE)
  const { enqueueSnackbar } = useSnackbar()
  const { journey } = useJourney()

  async function handleDuplicateStep(): Promise<void> {
    if (journey == null || step == null) return
    const { data } = await stepDuplicate({
      variables: {
        id: step.id,
        journeyId: journey.id,
        parentOrder: null,
        x: xPos != null ? xPos + STEP_NODE_DUPLICATE_OFFSET : null,
        y: yPos != null ? yPos + STEP_NODE_DUPLICATE_OFFSET : null
      },
      update(cache, { data }) {
        if (data?.blockDuplicate != null) {
          const lastStep = last(
            data.blockDuplicate.filter(
              (block) => block.__typename === 'StepBlock'
            )
          )

          cache.modify({
            id: cache.identify({ __typename: 'Journey', id: journey.id }),
            fields: {
              blocks(existingBlockRefs = []) {
                const duplicatedBlockRef = cache.writeFragment({
                  data: lastStep,
                  fragment: gql`
                    fragment DuplicatedBlock on Block {
                      id
                    }
                  `
                })
                return [...existingBlockRefs, duplicatedBlockRef]
              }
            }
          })

          cache.modify({
            fields: {
              blocks(existingBlockRefs = []) {
                const newStepBlockRef = cache.writeFragment({
                  data: lastStep,
                  fragment: gql`
                    fragment NewBlock on Block {
                      id
                    }
                  `
                })
                return [...existingBlockRefs, newStepBlockRef]
              }
            }
          })
        }
      }
    })

    if (data?.blockDuplicate != null) {
      const stepBlocks = transformer(
        data.blockDuplicate as BlockFields[]
      ) as Array<TreeBlock<StepBlock>>
      const steps = stepBlocks.filter(
        (block) => block.__typename === 'StepBlock'
      )
      const duplicatedStep = last(steps)

      dispatch({
        type: 'SetSelectedStepAction',
        selectedStep: duplicatedStep
      })
      enqueueSnackbar(t('Card Duplicated'), {
        variant: 'success',
        preventDuplicate: true
      })
      handleClick?.()
    }
  }

  return (
    <MenuItem
      label={t('Duplicate Card')}
      icon={<CopyLeftIcon color="inherit" />}
      disabled={disabled ?? step == null}
      onMouseUp={handleDuplicateStep}
      testId="DuplicateStep"
    />
  )
}
