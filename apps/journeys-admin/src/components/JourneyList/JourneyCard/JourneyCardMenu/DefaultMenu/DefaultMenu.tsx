import { ReactElement } from 'react'
import EditIcon from '@mui/icons-material/Edit'
import PeopleIcon from '@mui/icons-material/People'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import Divider from '@mui/material/Divider'
import Link from 'next/link'
import { ApolloQueryResult } from '@apollo/client'
import { MenuItem } from '../MenuItem'
import { DuplicateJourneyMenuItem } from '../DuplicateJourneyMenuItem.tsx/DuplicateJourneyMenuItem'
import { JourneyStatus } from '../../../../../../__generated__/globalTypes'
import { GetActiveJourneys } from '../../../../../../__generated__/GetActiveJourneys'
import { GetArchivedJourneys } from '../../../../../../__generated__/GetArchivedJourneys'
import { GetTrashedJourneys } from '../../../../../../__generated__/GetTrashedJourneys'
import { ArchiveJourney } from './ArchiveJourney'

interface DefaultMenuProps {
  id: string
  slug: string
  status: JourneyStatus
  journeyId: string
  published: boolean
  setOpenAccessDialog: () => void
  handleCloseMenu: () => void
  setOpenTrashDialog: () => void
  refetch?: () => Promise<
    ApolloQueryResult<
      GetActiveJourneys | GetArchivedJourneys | GetTrashedJourneys
    >
  >
}

export function DefaultMenu({
  id,
  slug,
  status,
  journeyId,
  published,
  setOpenAccessDialog,
  handleCloseMenu,
  setOpenTrashDialog,
  refetch
}: DefaultMenuProps): ReactElement {
  return (
    <>
      <Link href={`/journeys/${journeyId}`} passHref>
        <MenuItem
          icon={<EditIcon color="secondary" />}
          text="Edit"
          options={{ component: 'a' }}
        />
      </Link>

      <MenuItem
        icon={<PeopleIcon color="secondary" />}
        text="Access"
        handleClick={() => {
          setOpenAccessDialog()
          handleCloseMenu()
        }}
      />

      <MenuItem
        icon={<VisibilityIcon color="secondary" />}
        text="Preview"
        options={{
          disabled: !published,
          component: 'a',
          href: `/api/preview?slug=${slug}`,
          target: '_blank',
          rel: 'noopener'
        }}
      />

      <DuplicateJourneyMenuItem id={id} handleCloseMenu={handleCloseMenu} />

      <Divider />

      <ArchiveJourney
        status={status}
        id={journeyId}
        published={published}
        handleClose={handleCloseMenu}
        refetch={refetch}
      />

      <MenuItem
        icon={<DeleteOutlineRoundedIcon color="secondary" />}
        text="Trash"
        handleClick={() => {
          setOpenTrashDialog()
          handleCloseMenu()
        }}
      />
    </>
  )
}
