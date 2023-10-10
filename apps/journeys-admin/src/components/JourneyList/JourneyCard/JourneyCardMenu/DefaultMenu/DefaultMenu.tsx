import { ApolloQueryResult } from '@apollo/client'
import Divider from '@mui/material/Divider'
import NextLink from 'next/link'
import { ReactElement } from 'react'

import Edit2Icon from '@core/shared/ui/icons/Edit2'
import EyeOpenIcon from '@core/shared/ui/icons/EyeOpen'
import Trash2Icon from '@core/shared/ui/icons/Trash2'
import UsersProfiles2Icon from '@core/shared/ui/icons/UsersProfiles2'

import { GetJourneysAdmin } from '../../../../../../__generated__/GetJourneysAdmin'
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
  refetch?: () => Promise<ApolloQueryResult<GetJourneysAdmin>>
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
        <MenuItem label="Edit" icon={<Edit2Icon color="secondary" />} />
      </NextLink>
      {template !== true && (
        <MenuItem
          label="Access"
          icon={<UsersProfiles2Icon color="secondary" />}
          onClick={() => {
            setOpenAccessDialog()
            handleCloseMenu()
          }}
        />
      )}
      <NextLink href={`/api/preview?slug=${slug}`} passHref legacyBehavior>
        <MenuItem
          label="Preview"
          icon={<EyeOpenIcon color="secondary" />}
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
        icon={<Trash2Icon color="secondary" />}
        onClick={() => {
          setOpenTrashDialog()
          handleCloseMenu()
        }}
      />
    </>
  )
}
