import { ReactElement } from 'react'
import EditIcon from '@mui/icons-material/Edit'
import PeopleIcon from '@mui/icons-material/People'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import Divider from '@mui/material/Divider'
import Link from 'next/link'
import { MenuItem } from '../MenuItem'
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

      <Divider />

      <ArchiveJourney
        status={status}
        id={journeyId}
        published={published}
        handleClose={handleCloseMenu}
      />

      <MenuItem
        icon={<DeleteOutlineRoundedIcon color="secondary" />}
        text="Delete"
        handleClick={() => {
          setOpenTrashDialog()
          handleCloseMenu()
        }}
      />
    </>
  )
}
