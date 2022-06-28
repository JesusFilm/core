import { ReactElement } from 'react'
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded'
import IconButton from '@mui/material/IconButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import MenuItem from '@mui/material/MenuItem'
import { useEditor, ActiveTab } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'
import type { TreeBlock } from '@core/journeys/ui/block'
import { useSnackbar } from 'notistack'
import { gql, useMutation } from '@apollo/client'
import { BlockDuplicate } from '../../../__generated__/BlockDuplicate'
import {
  BlockFields,
  BlockFields_StepBlock as StepBlock
} from '../../../__generated__/BlockFields'

interface DuplicateBlockProps {
  variant: 'button' | 'list-item'
}

export const BLOCK_DUPLICATE = gql`
  mutation BlockDuplicate($id: ID!, $journeyId: ID!, $parentOrder: Int!) {
    blockDuplicate(id: $id, journeyId: $journeyId, parentOrder: $parentOrder) {
      id
    }
  }
`

export function DuplicateBlock({ variant }: DuplicateBlockProps): ReactElement {
  const [blockDuplicate] = useMutation<BlockDuplicate>(BLOCK_DUPLICATE)

  const {
    state: { selectedBlock },
    dispatch
  } = useEditor()
  const { enqueueSnackbar } = useSnackbar()
  const { journey } = useJourney()
  const blockLabel =
    selectedBlock?.__typename === 'StepBlock' ? 'Card' : 'Block'

  const handleDuplicateBlock = async (): Promise<void> => {
    if (selectedBlock != null && journey != null) {
      const { id, parentOrder } = selectedBlock
      if (parentOrder == null) return

      const { data } = await blockDuplicate({
        variables: {
          id,
          journeyId: journey.id,
          parentOrder: parentOrder + 1
        },
        update(cache, { data }) {
          if (data?.blockDuplicate != null) {
            cache.modify({
              id: cache.identify({ __typename: 'Journey', id: journey.id }),
              fields: {
                blocks(existingBlockRefs = []) {
                  const duplicatedBlockRef = cache.writeFragment({
                    data: data.blockDuplicate[parentOrder + 1],
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
          }
        }
      })
      if (data?.blockDuplicate != null) {
        if (selectedBlock.__typename === 'StepBlock') {
          const stepBlocks = transformer(
            data?.blockDuplicate as BlockFields[]
          ) as Array<TreeBlock<StepBlock>>
          const steps = stepBlocks.filter(
            (block) => block.__typename === 'StepBlock'
          )
          const duplicatedStep = steps[parentOrder + 1]
          dispatch({
            type: 'SetStepsAction',
            steps
          })
          dispatch({
            type: 'SetSelectedStepAction',
            step: duplicatedStep
          })
        } else {
          const block = transformer(data.blockDuplicate as BlockFields[])
          const duplicatedBlock = block[parentOrder + 1]
          dispatch({
            type: 'SetSelectedBlockAction',
            block: duplicatedBlock
          })
        }
        dispatch({
          type: 'SetActiveTabAction',
          activeTab: ActiveTab.Properties
        })
      }
    }
    enqueueSnackbar(`${blockLabel} Duplicated`, {
      variant: 'success',
      preventDuplicate: true
    })
  }

  return (
    <>
      {variant === 'button' ? (
        <IconButton
          id={`duplicate-${blockLabel}-actions`}
          aria-label={`Duplicate ${blockLabel} Actions`}
          onClick={handleDuplicateBlock}
        >
          <ContentCopyRounded />
        </IconButton>
      ) : (
        <MenuItem onClick={handleDuplicateBlock}>
          <ListItemIcon>
            <ContentCopyRounded color="inherit" />
          </ListItemIcon>
          <ListItemText>Duplicate {blockLabel}</ListItemText>
        </MenuItem>
      )}
    </>
  )
}
