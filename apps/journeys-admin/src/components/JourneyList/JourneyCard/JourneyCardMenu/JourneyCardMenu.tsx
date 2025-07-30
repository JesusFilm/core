import { ApolloQueryResult } from '@apollo/client'
import Box from '@mui/material/Box'
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

const JourneyDetailsDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "JourneyDetailsDialog" */
      '../../../Editor/Toolbar/JourneyDetails/JourneyDetailsDialog'
    ).then((mod) => mod.JourneyDetailsDialog),
  { ssr: false }
)

const TranslateJourneyDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "TranslateJourneyDialog" */
      './TranslateJourneyDialog'
    ).then((mod) => mod.TranslateJourneyDialog),
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
  hovered?: boolean
  onMenuClose?: () => void
}

/**
 * JourneyCardMenu component provides a menu interface for managing journey actions through a dropdown menu.
 * It dynamically loads different menu components based on the journey status and provides various dialogs
 * for journey management operations like access control, details editing, translation, and deletion.
 *
 * @param {Object} props - Component props
 * @param {string} props.id - The unique identifier for the journey
 * @param {JourneyStatus} props.status - The current status of the journey (e.g., draft, published, archived)
 * @param {string} props.slug - The URL slug used for journey navigation and preview
 * @param {boolean} props.published - Whether the journey is currently published
 * @param {boolean} [props.template] - Optional flag indicating if the journey is a template
 * @param {() => Promise<ApolloQueryResult<GetAdminJourneys>>} [props.refetch] - Optional callback to refetch journey data after operations
 * @param {Journey} [props.journey] - Optional journey object containing additional journey data
 * @param {boolean} [props.hovered] - Optional flag indicating if the menu button is being hovered over
 * @param {() => void} [props.onMenuClose] - Optional callback function triggered when the menu closes
 * @returns {ReactElement} A menu button that opens a dropdown with journey management options
 */

export function JourneyCardMenu({
  id,
  status,
  slug,
  published,
  template,
  refetch,
  journey,
  hovered,
  onMenuClose
}: JourneyCardMenuProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [open, setOpen] = useState<boolean | null>(null)

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
  const [openTranslateDialog, setOpenTranslateDialog] = useState<
    boolean | undefined
  >()
  const [keepMounted, setKeepMounted] = useState<boolean>(false)

  const [DefaultMenuItemsComponent, setDefaultMenuItemsComponent] = useState<
    ((args: any) => ReactElement) | null
  >(null)
  const [TrashMenuItemsComponent, setTrashMenuItemsComponent] = useState<
    ((args: any) => ReactElement) | null
  >(null)

  const handleOpenMenu = async (
    event: React.MouseEvent<HTMLElement>
  ): Promise<void> => {
    setAnchorEl(event.currentTarget)
    if (status === JourneyStatus.trashed) {
      if (TrashMenuItemsComponent == null) {
        const mod = await import(
          /* webpackChunkName: "TrashMenu" */
          './TrashMenu'
        )
        setTrashMenuItemsComponent(() => mod.TrashMenu)
      }
    } else {
      if (DefaultMenuItemsComponent == null) {
        const mod = await import(
          /* webpackChunkName: "DefaultMenu" */
          './DefaultMenu'
        )
        setDefaultMenuItemsComponent(() => mod.DefaultMenu)
      }
    }
    setOpen(true)
  }
  const handleCloseMenu = (): void => {
    setAnchorEl(null)
    setOpen(false)
    onMenuClose?.()
  }

  const handleKeepMounted = (): void => {
    setKeepMounted(true)
  }

  return (
    <>
      <Box
        data-testid="JourneyCardMenuButton"
        onClick={handleOpenMenu}
        sx={{
          width: { xs: '44px', sm: '20px' },
          height: { xs: '44px', sm: '30px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        <IconButton
          id="journey-actions"
          aria-controls="journey-actions"
          aria-haspopup="true"
          aria-expanded={open ? 'true' : 'false'}
          sx={{
            color: hovered ? 'gray.400' : 'white',
            '& svg': {
              filter: 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.4))'
            },
            '&:hover': {
              backgroundColor: '#FFF'
            },
            backgroundColor: hovered ? 'white' : 'transparent',
            transition: 'background-color 0.3s, color 0.3s',
            borderRadius: '10px',
            width: '20px',
            height: '30px',
            pointerEvents: 'none'
          }}
        >
          <MoreIcon data-testid="MoreIcon" />
        </IconButton>
      </Box>
      <Menu
        id="journey-actions"
        anchorEl={anchorEl}
        open={open ?? false}
        onClose={handleCloseMenu}
        keepMounted={keepMounted}
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
        {status === JourneyStatus.trashed
          ? TrashMenuItemsComponent && (
              <TrashMenuItemsComponent
                setOpenRestoreDialog={() => setOpenRestoreDialog(true)}
                setOpenDeleteDialog={() => setOpenDeleteDialog(true)}
                handleCloseMenu={handleCloseMenu}
              />
            )
          : DefaultMenuItemsComponent && (
              <DefaultMenuItemsComponent
                id={id}
                status={status}
                slug={slug}
                journeyId={id}
                journey={journey}
                published={published}
                handleKeepMounted={handleKeepMounted}
                setOpenAccessDialog={() => setOpenAccessDialog(true)}
                handleCloseMenu={handleCloseMenu}
                setOpenTrashDialog={() => setOpenTrashDialog(true)}
                setOpenTranslateDialog={() => setOpenTranslateDialog(true)}
                setOpenDetailsDialog={() => setOpenDetailsDialog(true)}
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
      {openTranslateDialog != null && (
        <TranslateJourneyDialog
          open={openTranslateDialog}
          onClose={() => setOpenTranslateDialog(false)}
          journey={journey}
        />
      )}
    </>
  )
}
