import { ReactElement } from 'react'
import EditIcon from '@mui/icons-material/Edit'
import PeopleIcon from '@mui/icons-material/People'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import Divider from '@mui/material/Divider'
import Link from 'next/link'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Typography from '@mui/material/Typography'
import { JourneyStatus } from '../../../../../../__generated__/globalTypes'
import { ArchiveJourney } from './ArchiveJourney'

interface DefaultMenuProps {
  slug: string
  status: JourneyStatus
  journeyId: string
  published: boolean
  setOpenAccessDialog: () => void
  handleCloseMenu: () => void
  setOpenTrashDialog: () => void
}

export function DefaultMenu({
  slug,
  status,
  journeyId,
  published,
  setOpenAccessDialog,
  handleCloseMenu,
  setOpenTrashDialog
}: DefaultMenuProps): ReactElement {
  return (
    <>
      <Link href={`/journeys/${slug}`} passHref>
        <MenuItem sx={{ pl: 7, pr: 17, pt: 4, pb: 4 }}>
          <ListItemIcon>
            <EditIcon color="secondary" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body1" sx={{ pl: 2 }}>
              Edit
            </Typography>
          </ListItemText>
        </MenuItem>
      </Link>

      <MenuItem
        sx={{ pl: 7, pr: 17, pt: 4, pb: 4 }}
        onClick={() => {
          setOpenAccessDialog()
          handleCloseMenu()
        }}
      >
        <ListItemIcon>
          <PeopleIcon color="secondary" />
        </ListItemIcon>
        <ListItemText>
          <Typography variant="body1" sx={{ pl: 2 }}>
            Access
          </Typography>
        </ListItemText>
      </MenuItem>

      <MenuItem
        sx={{ pl: 7, pr: 17, pt: 4, pb: 4 }}
        disabled={!published}
        component="a"
        href={`/api/preview?slug=${slug}`}
        target="_blank"
        rel="noopener"
      >
        <ListItemIcon>
          <VisibilityIcon color="secondary" />
        </ListItemIcon>
        <ListItemText>
          <Typography variant="body1" sx={{ pl: 2 }}>
            Preview
          </Typography>
        </ListItemText>
      </MenuItem>

      <Divider />

      <ArchiveJourney
        status={status}
        id={journeyId}
        published={published}
        handleClose={handleCloseMenu}
      />
      <MenuItem
        sx={{ pl: 7, pr: 17, pt: 4, pb: 4 }}
        onClick={() => {
          setOpenTrashDialog()
          handleCloseMenu()
        }}
      >
        <ListItemIcon>
          <DeleteOutlineRoundedIcon color="secondary" />
        </ListItemIcon>
        <ListItemText>
          <Typography variant="body1" sx={{ pl: 2 }}>
            Delete
          </Typography>
        </ListItemText>
      </MenuItem>
    </>
  )
}
