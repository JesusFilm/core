import { ApolloQueryResult, gql, useQuery } from '@apollo/client'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import dynamic from 'next/dynamic'
import { ReactElement, useState } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JOURNEY_FIELDS } from '@core/journeys/ui/JourneyProvider/journeyFields'
import MoreIcon from '@core/shared/ui/icons/More'

import {
  GetAdminJourneys,
  GetAdminJourneys_journeys as Journey
} from '../../../../../__generated__/GetAdminJourneys'
import {
  GetJourneyWithBlocks,
  GetJourneyWithBlocksVariables
} from '../../../../../__generated__/GetJourneyWithBlocks'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'

import { DefaultMenu } from './DefaultMenu'
import { TrashMenu } from './TrashMenu'

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

const SlugDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "SlugDialog" */
      '../../../Editor/Toolbar/Items/ShareItem/SlugDialog'
    ).then((mod) => mod.SlugDialog),
  { ssr: false }
)

const EmbedJourneyDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "EmbedJourneyDialog" */
      '../../../Editor/Toolbar/Items/ShareItem/EmbedJourneyDialog'
    ).then((mod) => mod.EmbedJourneyDialog),
  { ssr: false }
)

const QrCodeDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "QrCodeDialog" */
      '../../../Editor/Toolbar/Items/ShareItem/QrCodeDialog'
    ).then((mod) => mod.QrCodeDialog),
  { ssr: false }
)

const ShareDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "ShareDialog" */
      '../../../Editor/Toolbar/Items/ShareItem/ShareDialog'
    ).then((mod) => mod.ShareDialog),
  { ssr: false }
)

// Query for fetching journey with blocks for previews
export const GET_JOURNEY_WITH_BLOCKS = gql`
  ${JOURNEY_FIELDS}
  query GetJourneyWithBlocks($id: ID!) {
    journey: adminJourney(id: $id, idType: databaseId) {
      ...JourneyFields
    }
  }
`

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

  // Query to fetch journey with blocks when opening embed dialog
  const { data: journeyWithBlocksData } = useQuery<
    GetJourneyWithBlocks,
    GetJourneyWithBlocksVariables
  >(GET_JOURNEY_WITH_BLOCKS, {
    variables: { id },
    skip:
      !openEmbedDialog &&
      !openShareDialog &&
      !openSlugDialog &&
      !openQrCodeDialog
  })

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleCloseMenu = (): void => {
    setAnchorEl(null)
  }

  const journeyWithBlocks = journeyWithBlocksData?.journey

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
      {openShareDialog != null && journeyWithBlocks != null && (
        <JourneyProvider value={{ journey: journeyWithBlocks }}>
          <ShareDialog
            open={openShareDialog}
            onClose={() => setOpenShareDialog(false)}
          />
          {openSlugDialog != null && (
            <SlugDialog
              open={openSlugDialog}
              onClose={() => setOpenSlugDialog(false)}
            />
          )}
          {openEmbedDialog != null && (
            <EmbedJourneyDialog
              open={openEmbedDialog}
              onClose={() => setOpenEmbedDialog(false)}
            />
          )}
          {openQrCodeDialog != null && (
            <QrCodeDialog
              open={openQrCodeDialog}
              onClose={() => setOpenQrCodeDialog(false)}
            />
          )}
        </JourneyProvider>
      )}
    </>
  )
}
