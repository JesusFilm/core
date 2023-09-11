import { ApolloQueryResult } from '@apollo/client'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import { ReactElement, useState } from 'react'

import DotVertical from '@core/shared/ui/icons/DotVertical'

import { GetAdminJourneys } from '../../../../../__generated__/GetAdminJourneys'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { AccessDialog } from '../../../AccessDialog'

import { DefaultMenu } from './DefaultMenu'
import { DeleteJourneyDialog } from './DeleteJourneyDialog'
import { RestoreJourneyDialog } from './RestoreJourneyDialog'
import { TrashJourneyDialog } from './TrashJourneyDialog'
import { TrashMenu } from './TrashMenu'

export interface JourneyCardMenuProps {
  id: string
  status: JourneyStatus
  slug: string
  published: boolean
  template?: boolean
  refetch?: () => Promise<ApolloQueryResult<GetAdminJourneys>>
}

export function JourneyCardMenu({
  id,
  status,
  slug,
  published,
  template,
  refetch
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
        <DotVertical />
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
            id={id}
            status={status}
            slug={slug}
            journeyId={id}
            published={published}
            setOpenAccessDialog={() => setOpenAccessDialog(true)}
            handleCloseMenu={handleCloseMenu}
            setOpenTrashDialog={() => setOpenTrashDialog(true)}
            template={template}
            refetch={refetch}
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
        refetch={refetch}
      />
      <RestoreJourneyDialog
        id={id}
        published={published}
        open={openRestoreDialog}
        handleClose={() => setOpenRestoreDialog(false)}
        refetch={refetch}
      />
      <DeleteJourneyDialog
        id={id}
        open={openDeleteDialog}
        handleClose={() => setOpenDeleteDialog(false)}
        refetch={refetch}
      />
    </>
  )
}
