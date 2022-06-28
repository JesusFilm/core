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
            journeyId={journeyId}
            published={published}
            setOpenAccessDialog={() => setOpenAccessDialog(true)}
            handleCloseMenu={handleCloseMenu}
            setOpenTrashDialog={() => setOpenTrashDialog(true)}
          />
        )}
      </Menu>

      <AccessDialog
        journeySlug={slug}
        open={openAccessDialog}
        onClose={() => setOpenAccessDialog(false)}
      />
      <TrashJourneyDialog
        id={journeyId}
        open={openTrashDialog}
        handleClose={() => setOpenTrashDialog(false)}
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
