import { ReactElement } from 'react'
import IconButton from '@mui/material/IconButton'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'

interface DeleteBlockProps {
  handleDeleteBlock: () => void
}

export function DeleteBlock({
  handleDeleteBlock
}: DeleteBlockProps): ReactElement {
  return (
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
  )
}
