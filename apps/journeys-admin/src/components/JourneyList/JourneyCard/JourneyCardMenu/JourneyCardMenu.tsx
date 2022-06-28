import { ReactElement, useState } from 'react'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Link from 'next/link'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditIcon from '@mui/icons-material/Edit'
import PeopleIcon from '@mui/icons-material/People'
import VisibilityIcon from '@mui/icons-material/Visibility'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { AccessDialog } from '../../../AccessDialog'
import { ArchiveJourney } from './ArchiveJourney'
import { TrashJourney } from './TrashJourney'
import { RestoreJourneyDialog } from './RestoreJourneyDialog'
import { DeleteJourneyDialog } from './DeleteJourneyDialog'

export interface JourneyCardMenuProps {
  status: JourneyStatus
  slug: string
  journeyId: string
  published: boolean
  forceMenu?: boolean
}

export function JourneyCardMenu({
  status,
  slug,
  journeyId,
  published,
  forceMenu // this is only used for storybook snapshots
}: JourneyCardMenuProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = forceMenu === true ? true : Boolean(anchorEl)

  const [openAccessDialog, setOpenAccessDialog] = useState(false)
  const [openRestoreDialog, setOpenRestoreDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleCloseMenu = (): void => {
    setAnchorEl(null)
  }

  return (
    <>
      <IconButton
        id="journey-actions"
        aria-controls="journey-actions"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : 'false'}
        onClick={handleOpenMenu}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="journey-actions"
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        MenuListProps={{
          'aria-labelledby': 'journey-actions'
        }}
      >
        {status === JourneyStatus.trashed ? (
          <>
            <MenuItem
              sx={{ pl: 7, pr: 17, pt: 4, pb: 4 }}
              onClick={() => {
                setOpenRestoreDialog(true)
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
                setOpenDeleteDialog(true)
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
        ) : (
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
                setOpenAccessDialog(true)
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

            <TrashJourney id={journeyId} handleClose={handleCloseMenu} />
          </>
        )}
      </Menu>

      <AccessDialog
        journeySlug={slug}
        open={openAccessDialog}
        onClose={() => setOpenAccessDialog(false)}
      />
      <RestoreJourneyDialog
        id={journeyId}
        published={published}
        open={openRestoreDialog}
        handleClose={() => setOpenRestoreDialog(false)}
      />
      <DeleteJourneyDialog
        id={journeyId}
        open={openDeleteDialog}
        handleClose={() => setOpenDeleteDialog(false)}
      />
    </>
  )
}
