import { ReactElement, useState } from 'react'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { AccessDialog } from '../../../AccessDialog'
import { TrashJourneyDialog } from './TrashJourneyDialog'
import { RestoreJourneyDialog } from './RestoreJourneyDialog'
import { DeleteJourneyDialog } from './DeleteJourneyDialog'
import { DefaultMenu } from './DefaultMenu'
import { TrashMenu } from './TrashMenu'

export interface JourneyCardMenuProps {
  id: string
  status: JourneyStatus
  slug: string
  published: boolean
}

export function JourneyCardMenu({
  id,
  status,
  slug,
  published
}: JourneyCardMenuProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  const [openAccessDialog, setOpenAccessDialog] = useState(false)
  const [openTrashDialog, setOpenTrashDialog] = useState(false)
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
          <TrashMenu
            setOpenRestoreDialog={() => setOpenRestoreDialog(true)}
            setOpenDeleteDialog={() => setOpenDeleteDialog(true)}
            handleCloseMenu={handleCloseMenu}
          />
        ) : (
          <DefaultMenu
            status={status}
            slug={slug}
            journeyId={id}
            published={published}
            setOpenAccessDialog={() => setOpenAccessDialog(true)}
            handleCloseMenu={handleCloseMenu}
            setOpenTrashDialog={() => setOpenTrashDialog(true)}
          />
        )}
      </Menu>

      <AccessDialog
        journeyId={id}
        open={openAccessDialog}
        onClose={() => setOpenAccessDialog(false)}
      />
      <TrashJourneyDialog
        id={id}
        open={openTrashDialog}
        handleClose={() => setOpenTrashDialog(false)}
      />
      <RestoreJourneyDialog
        id={id}
        published={published}
        open={openRestoreDialog}
        handleClose={() => setOpenRestoreDialog(false)}
      />
      <DeleteJourneyDialog
        id={id}
        open={openDeleteDialog}
        handleClose={() => setOpenDeleteDialog(false)}
      />
    </>
  )
}
