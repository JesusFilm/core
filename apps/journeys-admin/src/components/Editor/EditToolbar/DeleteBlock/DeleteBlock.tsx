import { ReactElement } from 'react'
import IconButton from '@mui/material/IconButton'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'
import { gql, useMutation } from '@apollo/client'
import { useEditor, searchBlocks } from '@core/journeys/ui'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import { useSnackbar } from 'notistack'
import { BlockDelete } from '../../../../../__generated__/BlockDelete'
import { useJourney } from '../../../../libs/context'

export const BLOCK_DELETE = gql`
  mutation BlockDelete($id: ID!, $journeyId: ID!, $parentBlockId: ID!) {
    blockDelete(id: $id, journeyId: $journeyId, parentBlockId: $parentBlockId) {
      id
    }
  }
`

interface DeleteBlockProps {
  variant: 'button' | 'list-item'
}

export function DeleteBlock({
  variant = 'button'
}: DeleteBlockProps): ReactElement {
  const [blockDelete] = useMutation<BlockDelete>(BLOCK_DELETE)
  const { enqueueSnackbar } = useSnackbar()

  const { id: journeyId } = useJourney()
  const {
    state: { selectedBlock, selectedStep },
    dispatch
  } = useEditor()

  const handleDeleteBlock = async (): Promise<void> => {
    if (
      selectedBlock == null ||
      selectedBlock.__typename === 'CardBlock' ||
      selectedStep == null
    )
      return

    const block = selectedBlock.parentBlockId

    if (block == null) return

    const parentBlock = searchBlocks([selectedStep], block)

    if (parentBlock == null) return

    const children = parentBlock?.children.filter(
      ({ parentOrder }) => parentOrder != null
    )
    const indexToDelete = children?.findIndex(
      ({ id }) => id === selectedBlock.id
    )
    let newSelectedBlock

    switch (indexToDelete) {
      case 0:
        newSelectedBlock = children[1]
        break
      case children.length - 1:
        newSelectedBlock = children[indexToDelete - 1]
        break
      default:
        newSelectedBlock = children[indexToDelete + 1]
        break
    }

    const { data } = await blockDelete({
      variables: {
        id: selectedBlock.id,
        journeyId,
        parentBlockId: selectedBlock.parentBlockId
      },
      update(cache, { data }) {
        if (data?.blockDelete != null) {
          cache.modify({
            id: cache.identify({ __typename: 'Journey', id: journeyId }),
            fields: {
              blocks(existingBlockRefs = [], { readField }) {
                const ids = data.blockDelete.map(({ id }) => id)
                return existingBlockRefs.filter((blockRef) => {
                  const id = readField('id', blockRef) as string
                  return id != null && !ids.includes(id)
                })
              }
            }
          })
        }
      }
    })

    if (data?.blockDelete != null && newSelectedBlock != null) {
      dispatch({
        type: 'SetSelectedBlockByIdAction',
        id: newSelectedBlock.id
      })
    }
    enqueueSnackbar('Block Deleted', {
      variant: 'success',
      preventDuplicate: true
    })
  }

  return variant === 'button' ? (
    <IconButton
      id="delete-block-actions"
      edge="end"
      aria-controls="delete-block-actions"
      aria-haspopup="true"
      aria-expanded="true"
      onClick={handleDeleteBlock}
    >
      <DeleteOutlineRounded />
    </IconButton>
  ) : (
    <MenuItem onClick={handleDeleteBlock}>
      <ListItemIcon>
        <DeleteOutlineRounded />
      </ListItemIcon>
      <ListItemText>Delete Card</ListItemText>
    </MenuItem>
  )
}
