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
import Typography from '@mui/material/Typography'
import { SxProps } from '@mui/system/styleFunctionSx'
import { Theme } from '@mui/material/styles'
import { useSnackbar } from 'notistack'
import { gql, useMutation } from '@apollo/client'
import { BlockDuplicate } from '../../../__generated__/BlockDuplicate'
import { JourneyDuplicate } from '../../../__generated__/JourneyDuplicate'
import {
  BlockFields,
  BlockFields_StepBlock as StepBlock
} from '../../../__generated__/BlockFields'

interface DuplicateBlockProps {
  variant: 'button' | 'list-item'
  sx?: SxProps<Theme>
  journeyId?: string
}

export const BLOCK_DUPLICATE = gql`
  mutation BlockDuplicate($id: ID!, $journeyId: ID!, $parentOrder: Int!) {
    blockDuplicate(id: $id, journeyId: $journeyId, parentOrder: $parentOrder) {
      id
    }
  }
`

export const JOURNEY_DUPLICATE = gql`
  mutation JourneyDuplicate($id: ID!) {
    journeyDuplicate(id: $id) {
      id
    }
  }
`

export function DuplicateBlock({
  variant,
  sx,
  journeyId
}: DuplicateBlockProps): ReactElement {
  const [blockDuplicate] = useMutation<BlockDuplicate>(BLOCK_DUPLICATE)
  const [journeyDuplicate] = useMutation<JourneyDuplicate>(JOURNEY_DUPLICATE)

  const {
    state: { selectedBlock },
    dispatch
  } = useEditor()
  const { enqueueSnackbar } = useSnackbar()
  const { journey } = useJourney()
  const blockLabel =
    selectedBlock?.__typename === 'StepBlock' ? 'Card' : 'Block'
  const label = journeyId != null ? 'Journey' : blockLabel

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
  }

  const handleDuplicateJourney = async (): Promise<void> => {
    await journeyDuplicate({
      variables: {
        id: journeyId
      },
      update(cache, { data }) {
        if (data?.journeyDuplicate != null) {
          cache.modify({
            fields: {
              adminJourneys(existingAdminJourneyRefs = []) {
                const duplicatedJourneyRef = cache.writeFragment({
                  data: data.journeyDuplicate,
                  fragment: gql`
                    fragment DuplicatedJourney on Journey {
                      id
                    }
                  `
                })
                return [...existingAdminJourneyRefs, duplicatedJourneyRef]
              }
            }
          })
        }
      }
    })
  }

  const handleDuplicate = async (): Promise<void> => {
    if (journeyId != null) {
      await handleDuplicateJourney()
    } else {
      await handleDuplicateBlock()
    }

    enqueueSnackbar(`${label} Duplicated`, {
      variant: 'success',
      preventDuplicate: true
    })
  }

  return (
    <>
      {variant === 'button' ? (
        <IconButton
          id={`duplicate - ${label} -actions`}
          aria-label={`Duplicate ${label} Actions`}
          onClick={handleDuplicate}
        >
          <ContentCopyRounded />
        </IconButton>
      ) : (
        <MenuItem onClick={handleDuplicate} sx={{ ...sx }}>
          <ListItemIcon>
            <ContentCopyRounded
              color={journeyId != null ? 'secondary' : 'inherit'}
            />
          </ListItemIcon>
          <ListItemText>
            {journeyId != null ? (
              <Typography variant="body1" sx={{ pl: 2 }}>
                Duplicate
              </Typography>
            ) : (
              `Duplicate ${blockLabel} `
            )}
          </ListItemText>
        </MenuItem>
      )}
    </>
  )
}
