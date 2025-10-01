import { Reference, gql, useMutation } from '@apollo/client'
import IconButton from '@mui/material/IconButton'
import omit from 'lodash/omit'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { TreeBlock } from '@core/journeys/ui/block'
import { BLOCK_FIELDS } from '@core/journeys/ui/block/blockFields'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import CopyLeftIcon from '@core/shared/ui/icons/CopyLeft'

import {
  BlockDuplicate,
  BlockDuplicateVariables
} from '../../../../../../../../__generated__/BlockDuplicate'
import { BlockFields } from '../../../../../../../../__generated__/BlockFields'
import { BlockDuplicateIdMap } from '../../../../../../../../__generated__/globalTypes'
import { useBlockDuplicateCommand } from '../../../../../utils/useBlockDuplicateCommand'

interface DuplicateBlockProps {
  handleClick?: () => void
  disabled?: boolean
}

export const BLOCK_DUPLICATE = gql`
  ${BLOCK_FIELDS}
  mutation BlockDuplicate(
    $id: ID!
    $journeyId: ID!
    $parentOrder: Int
    $idMap: [BlockDuplicateIdMap!]
  ) {
    blockDuplicate(
      id: $id
      journeyId: $journeyId
      parentOrder: $parentOrder
      idMap: $idMap
    ) {
      id
      ...BlockFields
    }
  }
`

export function DuplicateBlock({
  handleClick,
  disabled = false
}: DuplicateBlockProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [blockDuplicate] = useMutation<BlockDuplicate, BlockDuplicateVariables>(
    BLOCK_DUPLICATE
  )
  const { addBlockDuplicate } = useBlockDuplicateCommand()

  function flatten(children: TreeBlock[]): TreeBlock[] {
    return children?.reduce<TreeBlock[]>((result, item) => {
      result.push(item)
      result.push(...flatten(item.children))
      return result
    }, [])
  }

  const {
    state: { selectedBlock },
    dispatch
  } = useEditor()
  const { enqueueSnackbar } = useSnackbar()
  const { journey } = useJourney()

  const disableAction = selectedBlock == null || disabled

  function handleDuplicateBlock(): void {
    if (selectedBlock == null || journey == null) return
    const { parentOrder } = selectedBlock
    if (parentOrder == null) return

    const block = {
      ...omit(selectedBlock, 'children'),
      id: uuidv4(),
      // ensures submitEnabled is false for button blocks on the optimistic response
      submitEnabled: false
    }

    const idMap: BlockDuplicateIdMap[] = [
      { oldId: selectedBlock.id, newId: block.id }
    ]

    const blockChildren = flatten(selectedBlock.children).map((block) => {
      const id = uuidv4()
      idMap.push({ oldId: block.id, newId: id })
      return {
        ...block,
        parentBlockId:
          idMap.find((map) => map.oldId === block.parentBlockId)?.newId ?? null,
        id
      }
    })

    addBlockDuplicate({
      block: block as BlockFields,
      execute() {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlockId: block.id
        })
        void blockDuplicate({
          variables: {
            id: selectedBlock.id,
            journeyId: journey.id,
            parentOrder: parentOrder + 1,
            idMap
          },
          optimisticResponse: {
            blockDuplicate: [
              selectedBlock,
              block as BlockFields,
              ...blockChildren
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
            })
          }
        })
      }
    })
    enqueueSnackbar(t('Block Duplicated'), {
      variant: 'success',
      preventDuplicate: true
    })
    handleClick?.()
  }

  return (
    <IconButton
      id="duplicate-block-actions"
      aria-label="Duplicate Block Actions"
      disabled={disableAction}
      onMouseUp={handleDuplicateBlock}
      data-testid="duplicate-block"
      sx={{
        p: 1
      }}
    >
      <CopyLeftIcon />
    </IconButton>
  )
}
