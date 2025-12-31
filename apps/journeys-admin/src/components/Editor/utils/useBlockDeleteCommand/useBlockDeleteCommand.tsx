import { gql, useApolloClient, useMutation } from '@apollo/client'

import { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import {
  ActiveContent,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_MultiselectBlock as MultiselectBlock
} from '../../../../../__generated__/BlockFields'
import { blockDeleteUpdate } from '../../../../libs/blockDeleteUpdate'
import { useBlockDeleteMutation } from '../../../../libs/useBlockDeleteMutation'
import { useBlockRestoreMutation } from '../../../../libs/useBlockRestoreMutation'
import { useJourneyUpdateMutation } from '../../../../libs/useJourneyUpdateMutation'
import { useMuxVideoUpload } from '../../../MuxVideoUploadProvider'

import { setBlockRestoreEditorState } from './setBlockRestoreEditorState'

export const MULTISELECT_BLOCK_UPDATE = gql`
  mutation MultiselectBlockUpdate_DeleteFlow(
    $id: ID!
    $input: MultiselectBlockUpdateInput!
  ) {
    multiselectBlockUpdate(id: $id, input: $input) {
      __typename
      id
      parentBlockId
      parentOrder
      min
      max
    }
  }
`

export function useBlockDeleteCommand(): {
  addBlockDelete: (currentBlock: TreeBlock) => void
} {
  const { add } = useCommand()
  const {
    state: { selectedStep, steps, activeSlide },
    dispatch
  } = useEditor()
  const { journey } = useJourney()
  const [blockDelete] = useBlockDeleteMutation()
  const [blockRestore] = useBlockRestoreMutation()
  const [journeyUpdate] = useJourneyUpdateMutation()
  const { cancelUploadForBlock } = useMuxVideoUpload()

  const [updateMultiselectBlock] = useMutation(MULTISELECT_BLOCK_UPDATE)

  function flatten(children: TreeBlock[]): TreeBlock[] {
    return children?.reduce<TreeBlock[]>((result, item) => {
      result.push(item)
      result.push(...flatten(item.children))
      return result
    }, [])
  }
  const client = useApolloClient()

  function findBlockById(
    root: TreeBlock | undefined,
    targetId: string | null | undefined
  ): TreeBlock | undefined {
    if (root == null || targetId == null) return undefined
    if (root.id === targetId) return root
    for (const child of root.children ?? []) {
      const found = findBlockById(child, targetId)
      if (found != null) return found
    }
    return undefined
  }

  function addBlockDelete(currentBlock: TreeBlock): void {
    if (
      journey == null ||
      steps == null ||
      selectedStep == null ||
      currentBlock?.id == null
    )
      return

    const deletedBlockParentOrder = currentBlock.parentOrder
    const card = selectedStep?.children?.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined
    const cachedStepWithXandY =
      client.cache.extract()[`StepBlock:${selectedStep.id}`]
    const stepSiblingsBeforeDelete = steps.filter(
      (block) => block.id !== currentBlock.id
    )
    const stepSiblingsAfterDelete = stepSiblingsBeforeDelete.map(
      (block, index) => ({
        ...block,
        parentOrder: block.parentOrder != null ? index : null
      })
    )
    const canvasSiblingsBeforeDelete =
      card?.children.filter((block) => block.id !== currentBlock.id) ?? []
    const canvasSiblingsAfterDelete = canvasSiblingsBeforeDelete.map(
      (block, index) => ({
        ...block,
        parentOrder: block.parentOrder != null ? index : null
      })
    )

    const isMenuBlock =
      currentBlock.id === journey.menuStepBlock?.id &&
      currentBlock.__typename === 'StepBlock'

    add({
      parameters: {
        execute: {},
        undo: {}
      },
      execute() {
        cancelUploadForBlock(currentBlock)

        const nextSelectedStep =
          stepSiblingsAfterDelete.find(
            ({ parentOrder }) => parentOrder === deletedBlockParentOrder
          ) ??
          stepSiblingsAfterDelete.find(({ parentOrder }) => {
            return deletedBlockParentOrder != null
              ? parentOrder === deletedBlockParentOrder - 1
              : null
          })
        currentBlock.__typename === 'StepBlock'
          ? dispatch({
              type: 'SetEditorFocusAction',
              selectedStep: nextSelectedStep,
              selectedBlock: nextSelectedStep,
              activeSlide: ActiveSlide.JourneyFlow,
              activeContent: ActiveContent.Canvas
            })
          : dispatch({
              type: 'SetEditorFocusAction',
              selectedBlock:
                deletedBlockParentOrder != null
                  ? canvasSiblingsAfterDelete.find(
                      ({ parentOrder }) =>
                        parentOrder === deletedBlockParentOrder - 1
                    )
                  : undefined,
              selectedStep,
              activeContent: ActiveContent.Canvas,
              activeSlide: activeSlide
            })

        void blockDelete(currentBlock, {
          optimisticResponse: { blockDelete: canvasSiblingsAfterDelete },
          update(cache, { data }) {
            blockDeleteUpdate(
              currentBlock,
              data?.blockDelete,
              cache,
              journey.id
            )
          }
        })

        // If deleting a Multiselect option, ensure the parent Multiselect max is not above remaining options
        if (
          currentBlock.__typename === 'MultiselectOptionBlock' &&
          currentBlock.parentBlockId != null
        ) {
          const parent = findBlockById(selectedStep, currentBlock.parentBlockId)
          if (parent?.__typename === 'MultiselectBlock') {
            const multiselectParent = parent as TreeBlock<MultiselectBlock>
            const optionSiblings = (multiselectParent.children ?? []).filter(
              (c) => c.__typename === 'MultiselectOptionBlock'
            ).length
            const remainingOptions = Math.max(0, optionSiblings - 1)
            const parentMax = multiselectParent.max
            if (parentMax != null && parentMax > remainingOptions) {
              void updateMultiselectBlock({
                variables: {
                  id: multiselectParent.id,
                  input: { max: remainingOptions }
                },
                optimisticResponse: {
                  multiselectBlockUpdate: {
                    __typename: 'MultiselectBlock',
                    id: multiselectParent.id,
                    parentBlockId: multiselectParent.parentBlockId ?? null,
                    parentOrder: multiselectParent.parentOrder ?? 0,
                    min: multiselectParent.min ?? null,
                    max: remainingOptions
                  }
                }
              })
            }
          }
        }

        if (isMenuBlock) {
          void journeyUpdate({
            variables: {
              id: journey.id,
              input: {
                menuStepBlockId: null
              }
            },
            optimisticResponse: {
              journeyUpdate: {
                ...journey,
                menuStepBlock: null
              }
            }
          })
        }
      },
      undo() {
        const flattenedChildren = flatten(currentBlock?.children)
        setBlockRestoreEditorState(currentBlock, selectedStep, dispatch)
        void blockRestore({
          variables: { id: currentBlock.id },
          optimisticResponse:
            currentBlock.__typename === 'StepBlock'
              ? {
                  blockRestore: [
                    { ...currentBlock, ...cachedStepWithXandY },
                    ...flattenedChildren,
                    ...stepSiblingsBeforeDelete
                  ]
                }
              : {
                  blockRestore: [
                    currentBlock,
                    ...flattenedChildren,
                    ...canvasSiblingsBeforeDelete
                  ]
                }
        })

        if (isMenuBlock)
          void journeyUpdate({
            variables: {
              id: journey.id,
              input: {
                menuStepBlockId: currentBlock.id
              }
            },
            optimisticResponse: {
              journeyUpdate: {
                ...journey,
                menuStepBlock: currentBlock
              }
            }
          })
      }
    })
  }

  return { addBlockDelete }
}
