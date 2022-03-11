import { ReactElement } from 'react'
import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Button from '@mui/material/Button'

interface DeleteModalProps {
  handleDelete: () => void
  open: boolean
  handleClose: () => void
}

export function DeleteModal({
  handleDelete,
  open,
  handleClose
}: DeleteModalProps): ReactElement {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="delete-card-modal"
      aria-describedby="delete-card-modal"
      sx={{
        height: '188px',
        width: '372px',
        m: 'auto'
      }}
    >
      <Card
        sx={{
          display: 'flex',
          flexDirection: 'column',
          px: 2,
          pb: 2
        }}
      >
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Delete Card?
          </Typography>
          <Typography variant="body1">
            Are you sure you would like to delete this card?
          </Typography>
        </CardContent>
        <CardActions sx={{ ml: 'auto' }}>
          <Button
            color="secondary"
            onClick={handleClose}
            sx={{ fontWeight: 'normal' }}
          >
            Cancel
          </Button>
          <Button onClick={handleDelete} sx={{ fontWeight: 'normal', ml: 6 }}>
            Delete
          </Button>
        </CardActions>
      </Card>
    </Modal>
  )
}
