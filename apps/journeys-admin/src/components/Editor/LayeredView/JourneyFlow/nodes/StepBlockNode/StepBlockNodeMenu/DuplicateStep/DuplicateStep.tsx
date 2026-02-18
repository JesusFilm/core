import { Reference, gql, useMutation } from '@apollo/client'
import omit from 'lodash/omit'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { TreeBlock } from '@core/journeys/ui/block'
import { BLOCK_FIELDS } from '@core/journeys/ui/block/blockFields'
import {
  ActiveContent,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import CopyLeftIcon from '@core/shared/ui/icons/CopyLeft'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../../../__generated__/BlockFields'
import { BlockDuplicateIdMap } from '../../../../../../../../../__generated__/globalTypes'
import {
  StepDuplicate_blockDuplicate as StepBlockChildren,
  StepDuplicate_blockDuplicate_StepBlock as StepBlockWitPos,
  StepDuplicate,
  StepDuplicateVariables
} from '../../../../../../../../../__generated__/StepDuplicate'
import { MenuItem } from '../../../../../../../MenuItem'
import { useBlockDuplicateCommand } from '../../../../../../utils/useBlockDuplicateCommand'
import { STEP_NODE_DUPLICATE_OFFSET } from '../../libs/sizes'

interface DuplicateStepProps {
  step: TreeBlock<StepBlock>
  xPos?: number
  yPos?: number
  handleClick?: () => void
  disabled?: boolean
}

export const STEP_DUPLICATE = gql`
  ${BLOCK_FIELDS}
  mutation StepDuplicate(
    $id: ID!
    $journeyId: ID!
    $parentOrder: Int
    $idMap: [BlockDuplicateIdMap!]
    $x: Int
    $y: Int
  ) {
    blockDuplicate(
      id: $id
      journeyId: $journeyId
      parentOrder: $parentOrder
      idMap: $idMap
      x: $x
      y: $y
    ) {
      id
      ...BlockFields
      ... on StepBlock {
        id
        x
        y
      }
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
  const {
    dispatch,
    state: { steps }
  } = useEditor()
  const [stepDuplicate] = useMutation<StepDuplicate, StepDuplicateVariables>(
    STEP_DUPLICATE
  )
  const { enqueueSnackbar } = useSnackbar()

  function flatten(children: TreeBlock[]): TreeBlock[] {
    return children?.reduce<TreeBlock[]>((result, item) => {
      result.push(item)
      result.push(...flatten(item.children))
      return result
    }, [])
  }

  const { journey } = useJourney()
  const { addBlockDuplicate } = useBlockDuplicateCommand()

  function handleDuplicateStep(): void {
    if (journey == null || step == null) return
    const stepBlock: StepBlockWitPos = {
      ...omit(step, 'children'),
      id: uuidv4(),
      nextBlockId: null,
      parentOrder: steps?.length ?? 0,
      x: xPos != null ? xPos + STEP_NODE_DUPLICATE_OFFSET : null,
      y: yPos != null ? yPos : null
    }

    const idMap: BlockDuplicateIdMap[] = [
      { oldId: step.id, newId: stepBlock.id }
    ]
    const stepSiblings = flatten(step.children)?.map((block) => {
      const id = uuidv4()
      idMap.push({ oldId: block.id, newId: id })
      return {
        ...block,
        parentBlockId: idMap.find((map) => map.oldId === block.parentBlockId)
          ?.newId,
        id
      }
    })

    addBlockDuplicate({
      block: stepBlock,
      execute() {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedStepId: stepBlock.id,
          selectedBlockId: stepBlock.id,
          activeSlide: ActiveSlide.JourneyFlow,
          activeContent: ActiveContent.Canvas
        })
        void stepDuplicate({
          variables: {
            id: step.id,
            journeyId: journey.id,
            parentOrder: stepBlock.parentOrder,
            idMap,
            x: stepBlock.x,
            y: stepBlock.y
          },
          optimisticResponse: {
            blockDuplicate: [
              stepBlock,
              ...(stepSiblings as StepBlockChildren[])
            ]
          },
          update(cache, { data }) {
            if (data?.blockDuplicate == null) return
            data.blockDuplicate.forEach((block) => {
              cache.modify({
                id: cache.identify({ __typename: 'Journey', id: journey.id }),
                fields: {
                  blocks(existingBlockRefs: Reference[], { readField }) {
                    const duplicatedBlockRef = cache.writeFragment({
                      data: block,
                      fragment: gql`
                        fragment DuplicatedBlock on Block {
                          id
                        }
                      `
                    })
                    if (
                      existingBlockRefs?.some(
                        (ref) => readField('id', ref) === block.id
                      )
                    ) {
                      return existingBlockRefs ?? []
                    }
                    return [...existingBlockRefs, duplicatedBlockRef]
                  }
                }
              })
              cache.modify({
                fields: {
                  blocks(existingBlockRefs: Reference[], { readField }) {
                    const newStepBlockRef = cache.writeFragment({
                      data: block,
                      fragment: gql`
                        fragment NewBlock on Block {
                          id
                        }
                      `
                    })
                    if (
                      existingBlockRefs?.some(
                        (ref) => readField('id', ref) === block.id
                      ) ||
                      newStepBlockRef?.__ref !== `StepBlock:${stepBlock.id}`
                    ) {
                      return existingBlockRefs ?? []
                    }

                    return [...existingBlockRefs, newStepBlockRef]
                  }
                }
              })
            })
          },
          onCompleted: () => {
            enqueueSnackbar(t('Card Duplicated'), {
              variant: 'success',
              preventDuplicate: true
            })
          }
        })
        handleClick?.()
      }
    })

    dispatch({
      type: 'SetHoveredStepAction',
      hoveredStep: undefined
    })
  }

  return (
    <MenuItem
      label={t('Duplicate Card')}
      icon={<CopyLeftIcon color="inherit" />}
      disabled={disabled ?? step == null}
      onClick={handleDuplicateStep}
      testId="DuplicateStep"
    />
  )
}
