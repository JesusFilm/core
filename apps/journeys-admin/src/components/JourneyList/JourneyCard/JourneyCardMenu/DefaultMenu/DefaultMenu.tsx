import { ApolloQueryResult } from '@apollo/client'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditIcon from '@mui/icons-material/Edit'
import PeopleIcon from '@mui/icons-material/People'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Divider from '@mui/material/Divider'
import NextLink from 'next/link'
import { ReactElement } from 'react'

import { GetAdminJourneys } from '../../../../../../__generated__/GetAdminJourneys'
import { JourneyStatus } from '../../../../../../__generated__/globalTypes'
import { MenuItem } from '../../../../MenuItem'
import { CopyToTeamMenuItem } from '../../../../Team/CopyToTeamMenuItem/CopyToTeamMenuItem'
import { DuplicateJourneyMenuItem } from '../DuplicateJourneyMenuItem'

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
  template?: boolean
  refetch?: () => Promise<ApolloQueryResult<GetAdminJourneys>>
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
  template,
  refetch
}: DefaultMenuProps): ReactElement {
  return (
    <>
      <NextLink
        href={
          template === true
            ? `/templates/${journeyId}`
            : `/journeys/${journeyId}`
        }
        passHref
        legacyBehavior
      >
        <MenuItem label="Edit" icon={<EditIcon color="secondary" />} />
      </NextLink>
      {template !== true && (
        <MenuItem
          label="Access"
          icon={<PeopleIcon color="secondary" />}
          onClick={() => {
            setOpenAccessDialog()
            handleCloseMenu()
          }}
        />
      )}
      <NextLink href={`/api/preview?slug=${slug}`} passHref legacyBehavior>
        <MenuItem
          label="Preview"
          icon={<VisibilityIcon color="secondary" />}
          disabled={!published}
          openInNew
        />
      </NextLink>
      {template !== true && (
        <DuplicateJourneyMenuItem id={id} handleCloseMenu={handleCloseMenu} />
      )}
      <Divider />
      <CopyToTeamMenuItem id={id} handleCloseMenu={handleCloseMenu} />
      <ArchiveJourney
        status={status}
        id={journeyId}
        published={published}
        handleClose={handleCloseMenu}
        refetch={refetch}
      />
      <MenuItem
        label="Trash"
        icon={<DeleteOutlineRoundedIcon color="secondary" />}
        onClick={() => {
          setOpenTrashDialog()
          handleCloseMenu()
        }}
      />
    </>
  )
}
