import { ReactElement } from 'react'
import { useMutation, gql } from '@apollo/client'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Typography from '@mui/material/Typography'
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'

interface DeleteJourneyProps {
  id: string
  published: boolean
  handleClose: () => void
}

export function DeleteJourney({
  id,
  published,
  handleClose
}: DeleteJourneyProps): ReactElement {
  return (
    <>
      <MenuItem sx={{ pl: 7, pr: 17, pt: 4, pb: 4 }}>
        <ListItemIcon>
          <CheckCircleRoundedIcon color="secondary" />
        </ListItemIcon>
        <ListItemText>
          <Typography variant="body1" sx={{ pl: 2 }}>
            Restore
          </Typography>
        </ListItemText>
      </MenuItem>

      <MenuItem sx={{ pl: 7, pr: 17, pt: 4, pb: 4 }}>
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
