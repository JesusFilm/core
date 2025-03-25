import { ApolloQueryResult } from '@apollo/client'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import dynamic from 'next/dynamic'
import { ReactElement, useState } from 'react'

import MoreIcon from '@core/shared/ui/icons/More'

import {
  GetAdminJourneys,
  GetAdminJourneys_journeys as Journey
} from '../../../../../__generated__/GetAdminJourneys'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { ShareDialog } from '../../../Editor/Toolbar/Items/ShareItem/ShareDialog/ShareDialog'

const AccessDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "AccessDialog" */
      '../../../AccessDialog'
    ).then((mod) => mod.AccessDialog),
  { ssr: false }
)

const DeleteJourneyDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "DeleteJourneyDialog" */
      './DeleteJourneyDialog'
    ).then((mod) => mod.DeleteJourneyDialog),
  { ssr: false }
)

const RestoreJourneyDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "RestoreJourneyDialog" */
      './RestoreJourneyDialog'
    ).then((mod) => mod.RestoreJourneyDialog),
  { ssr: false }
)

const TrashJourneyDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "RestoreJourneyDialog" */
      './TrashJourneyDialog'
    ).then((mod) => mod.TrashJourneyDialog),
  { ssr: false }
)

const DefaultMenu = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "DefaultMenu" */
      './DefaultMenu'
    ).then((mod) => mod.DefaultMenu),
  { ssr: false }
)

const TrashMenu = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "TrashMenu" */
      './TrashMenu'
    ).then((mod) => mod.TrashMenu),
  { ssr: false }
)

const JourneyDetailsDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "JourneyDetailsDialog" */
      '../../../Editor/Toolbar/JourneyDetails/JourneyDetailsDialog'
    ).then((mod) => mod.JourneyDetailsDialog),
  { ssr: false }
)

export interface JourneyCardMenuProps {
  id: string
  status: JourneyStatus
  slug: string
  published: boolean
  template?: boolean
  refetch?: () => Promise<ApolloQueryResult<GetAdminJourneys>>
  journey?: Journey
}

export function JourneyCardMenu({
  id,
  status,
  slug,
  published,
  template,
  refetch,
  journey
}: JourneyCardMenuProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  const [openAccessDialog, setOpenAccessDialog] = useState<
    boolean | undefined
  >()
  const [openTrashDialog, setOpenTrashDialog] = useState<boolean | undefined>()
  const [openRestoreDialog, setOpenRestoreDialog] = useState<
    boolean | undefined
  >()
  const [openDeleteDialog, setOpenDeleteDialog] = useState<
    boolean | undefined
  >()
  const [openDetailsDialog, setOpenDetailsDialog] = useState<
    boolean | undefined
  >()
  const [openShareDialog, setOpenShareDialog] = useState<boolean | undefined>()
  const [openSlugDialog, setOpenSlugDialog] = useState<boolean | undefined>()
  const [openEmbedDialog, setOpenEmbedDialog] = useState<boolean | undefined>()
  const [openQrCodeDialog, setOpenQrCodeDialog] = useState<
    boolean | undefined
  >()

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
        edge="end"
      >
        <MoreIcon />
      </IconButton>
      <Menu
        id="journey-actions"
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        MenuListProps={{
          'aria-labelledby': 'journey-actions'
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        data-testid="JourneyCardMenu"
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
            setOpenDetailsDialog={() => setOpenDetailsDialog(true)}
            setOpenShareDialog={() => setOpenShareDialog(true)}
            template={template}
            refetch={refetch}
          />
        )}
      </Menu>
      {openAccessDialog != null && (
        <AccessDialog
          journeyId={id}
          open={openAccessDialog}
          onClose={() => setOpenAccessDialog(false)}
        />
      )}
      {openTrashDialog != null && (
        <TrashJourneyDialog
          id={id}
          open={openTrashDialog}
          handleClose={() => setOpenTrashDialog(false)}
          refetch={refetch}
        />
      )}
      {openRestoreDialog != null && (
        <RestoreJourneyDialog
          id={id}
          open={openRestoreDialog}
          published={published}
          handleClose={() => setOpenRestoreDialog(false)}
          refetch={refetch}
        />
      )}
      {openDeleteDialog != null && (
        <DeleteJourneyDialog
          id={id}
          open={openDeleteDialog}
          handleClose={() => setOpenDeleteDialog(false)}
          refetch={refetch}
        />
      )}
      {openDetailsDialog != null && (
        <JourneyDetailsDialog
          open={openDetailsDialog}
          onClose={() => setOpenDetailsDialog(false)}
          journey={journey}
        />
      )}
      {openShareDialog != null && (
        <ShareDialog
          open={openShareDialog}
          onClose={() => setOpenShareDialog(false)}
          onSlugDialogOpen={() => setOpenSlugDialog(true)}
          onEmbedDialogOpen={() => setOpenEmbedDialog(true)}
          onQrCodeDialogOpen={() => setOpenQrCodeDialog(true)}
        />
      )}
    </>
  )
}
