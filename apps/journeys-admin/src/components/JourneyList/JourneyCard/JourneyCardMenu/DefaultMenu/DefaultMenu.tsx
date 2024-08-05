import { ApolloQueryResult } from '@apollo/client'
import Divider from '@mui/material/Divider'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useTeam } from '@core/journeys/ui/TeamProvider'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import EyeOpenIcon from '@core/shared/ui/icons/EyeOpen'
import Trash2Icon from '@core/shared/ui/icons/Trash2'
import UsersProfiles2Icon from '@core/shared/ui/icons/UsersProfiles2'

import { GetAdminJourneys } from '../../../../../../__generated__/GetAdminJourneys'
import { JourneyStatus } from '../../../../../../__generated__/globalTypes'
import { useCustomDomainsQuery } from '../../../../../libs/useCustomDomainsQuery'
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
  const { t } = useTranslation('apps-journeys-admin')
  const { activeTeam } = useTeam()
  const { hostname } = useCustomDomainsQuery({
    variables: { teamId: activeTeam?.id ?? '' },
    skip: activeTeam?.id == null
  })

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
        prefetch={false}
      >
        <MenuItem label={t('Edit')} icon={<Edit2Icon color="secondary" />} />
      </NextLink>
      {template !== true && (
        <MenuItem
          label={t('Access')}
          icon={<UsersProfiles2Icon color="secondary" />}
          onClick={() => {
            setOpenAccessDialog()
            handleCloseMenu()
          }}
        />
      )}
      <NextLink
        href={`/api/preview?slug=${slug}${
          hostname != null ? `&hostname=${hostname}` : ''
        }`}
        passHref
        legacyBehavior
        prefetch={false}
      >
        <MenuItem
          label={t('Preview')}
          icon={<EyeOpenIcon color="secondary" />}
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
        label={t('Trash')}
        icon={<Trash2Icon color="secondary" />}
        onClick={() => {
          setOpenTrashDialog()
          handleCloseMenu()
        }}
      />
    </>
  )
}
