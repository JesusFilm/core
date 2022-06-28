import { ReactElement } from 'react'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Typography from '@mui/material/Typography'

interface TrashMenuProps {
  setOpenRestoreDialog: () => void
  setOpenDeleteDialog: () => void
  handleCloseMenu: () => void
}

export function TrashMenu({
  setOpenRestoreDialog,
  setOpenDeleteDialog,
  handleCloseMenu
}: TrashMenuProps): ReactElement {
  return (
    <>
      <MenuItem
        sx={{ pl: 7, pr: 17, pt: 4, pb: 4 }}
        onClick={() => {
          setOpenRestoreDialog()
          handleCloseMenu()
        }}
      >
        <ListItemIcon>
          <CheckCircleRoundedIcon color="secondary" />
        </ListItemIcon>
        <ListItemText>
          <Typography variant="body1" sx={{ pl: 2 }}>
            Restore
          </Typography>
        </ListItemText>
      </MenuItem>

      <MenuItem
        sx={{ pl: 7, pr: 17, pt: 4, pb: 4 }}
        onClick={() => {
          setOpenDeleteDialog()
          handleCloseMenu()
        }}
      >
        <ListItemIcon>
          <DeleteForeverRoundedIcon color="secondary" />
        </ListItemIcon>
        <ListItemText>
          <Typography variant="body1" sx={{ pl: 2 }}>
            Delete Forever
          </Typography>
        </ListItemText>
      </MenuItem>
    </>
  )
}
