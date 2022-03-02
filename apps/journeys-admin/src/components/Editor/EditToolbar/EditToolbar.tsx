import { ReactElement, useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import IconButton from '@mui/material/IconButton'
import MoreVert from '@mui/icons-material/MoreVert'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Divider from '@mui/material/Divider'
import Edit from '@mui/icons-material/Edit'
import Share from '@mui/icons-material/Share'
import Settings from '@mui/icons-material/Settings'
import {
  BUTTON_FIELDS,
  IMAGE_FIELDS,
  RADIO_QUESTION_FIELDS,
  SIGN_UP_FIELDS,
  TYPOGRAPHY_FIELDS,
  useEditor,
  VIDEO_FIELDS
} from '@core/journeys/ui'
import { BlockDelete } from '../../../../__generated__/BlockDelete'
import { useJourney } from '../../../libs/context'
import { Alert } from './Alert'

export const BLOCK_DELETE = gql`
  ${BUTTON_FIELDS}
  ${IMAGE_FIELDS}
  ${RADIO_QUESTION_FIELDS}
  ${SIGN_UP_FIELDS}
  ${TYPOGRAPHY_FIELDS}
  ${VIDEO_FIELDS}
  mutation BlockDelete($id: ID!, $journeyId: ID!, $parentBlockId: ID!) {
    blockDelete(id: $id, journeyId: $journeyId, parentBlockId: $parentBlockId) {
      id
      journeyId
      parentBlockId
      ...ButtonFields
      ...ImageFields
      ...RadioQuestionFields
      ...SignUpFields
      ...TypographyFields
      ...VideoFields
    }
  }
`

export function EditToolbar(): ReactElement {
  const [blockDelete] = useMutation<BlockDelete>(BLOCK_DELETE)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)

  const { id: journeyId } = useJourney()
  const {
    state: { selectedBlock }
  } = useEditor()

  const handleShowMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleCloseMenu = (): void => {
    setAnchorEl(null)
  }

  const handleDeleteBlock = async (): Promise<void> => {
    if (selectedBlock != null && selectedBlock.__typename !== 'CardBlock') {
      await blockDelete({
        variables: {
          id: selectedBlock.id,
          journeyId,
          parentBlockId: selectedBlock.parentBlockId
        }
      })
    }

    setShowDeleteAlert(true)
  }

  return (
    <>
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
      <IconButton
        id="edit-journey-actions"
        edge="end"
        aria-controls="edit-journey-actions"
        aria-haspopup="true"
        aria-expanded="true"
        onClick={handleShowMenu}
      >
        <MoreVert />
      </IconButton>

      <Menu
        id="edit-journey-actions"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        MenuListProps={{
          'aria-labelledby': 'edit-journey-actions'
        }}
      >
        <MenuItem>
          <ListItemIcon>
            <Edit />
          </ListItemIcon>
          <ListItemText>Edit Card</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteBlock}>
          <ListItemIcon>
            <DeleteOutlineRounded />
          </ListItemIcon>
          <ListItemText>Delete Card</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem>
          <ListItemIcon>
            <Share />
          </ListItemIcon>
          <ListItemText>Social Settings</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem>
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText>Journey Settings</ListItemText>
        </MenuItem>
      </Menu>

      <Alert
        open={showDeleteAlert}
        setOpen={setShowDeleteAlert}
        message="Block Deleted"
      />
    </>
  )
}
