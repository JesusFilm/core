import { ApolloQueryResult, gql, useQuery } from '@apollo/client'
import Divider from '@mui/material/Divider'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useMemo } from 'react'

import { useTeam } from '@core/journeys/ui/TeamProvider'
import { useUserRoleQuery } from '@core/journeys/ui/useUserRoleQuery'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import EyeOpenIcon from '@core/shared/ui/icons/EyeOpen'
import Trash2Icon from '@core/shared/ui/icons/Trash2'
import UsersProfiles2Icon from '@core/shared/ui/icons/UsersProfiles2'

import { GetAdminJourneys } from '../../../../../../__generated__/GetAdminJourneys'
import {
  JourneyStatus,
  Role,
  UserJourneyRole,
  UserTeamRole
} from '../../../../../../__generated__/globalTypes'
import { useCurrentUserLazyQuery } from '../../../../../libs/useCurrentUserLazyQuery'
import { useCustomDomainsQuery } from '../../../../../libs/useCustomDomainsQuery'
import { MenuItem } from '../../../../MenuItem'
import { CopyToTeamMenuItem } from '../../../../Team/CopyToTeamMenuItem/CopyToTeamMenuItem'
import { DuplicateJourneyMenuItem } from '../DuplicateJourneyMenuItem'

import { ArchiveJourney } from './ArchiveJourney'

export const GET_JOURNEY_WITH_USER_ROLES = gql`
  query GetJourneyWithUserRoles($id: ID!) {
    journey(id: $id, idType: databaseId) {
      id
      userJourneys {
        id
        role
        user {
          id
        }
      }
    }
  }
`

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
  const { data: userRoleData } = useUserRoleQuery()
  const { hostname } = useCustomDomainsQuery({
    variables: { teamId: activeTeam?.id ?? '' },
    skip: activeTeam?.id == null
  })

  const { loadUser, data: currentUser } = useCurrentUserLazyQuery()

  const { data: journeyData } = useQuery(GET_JOURNEY_WITH_USER_ROLES, {
    variables: { id: journeyId },
    skip: currentUser?.id == null
  })

  useEffect(() => {
    void loadUser()
  }, [loadUser])

  // Determine the current user's role for this journey
  const userRole = useMemo<UserJourneyRole | undefined>(() => {
    if (journeyData?.journey?.userJourneys == null || currentUser?.id == null)
      return undefined

    const userJourney = journeyData.journey.userJourneys.find(
      (userJourney) => userJourney.user?.id === currentUser.id
    )

    return userJourney?.role
  }, [journeyData?.journey?.userJourneys, currentUser?.id])

  // Determine the current user's role in the team
  const teamRole = useMemo<UserTeamRole | undefined>(() => {
    if (activeTeam?.userTeams == null || currentUser?.email == null)
      return undefined

    const userTeam = activeTeam.userTeams.find(
      (userTeam) => userTeam.user.email === currentUser.email
    )

    return userTeam?.role
  }, [activeTeam?.userTeams, currentUser?.email])

  const isPublisher =
    userRoleData?.getUserRole?.roles?.includes(Role.publisher) === true

  const canManageJourney =
    userRole === UserJourneyRole.owner ||
    teamRole === UserTeamRole.manager ||
    (isPublisher && template === true)

  const cantManageJourney = !canManageJourney

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
        disabled={cantManageJourney}
      />
      <MenuItem
        label={t('Trash')}
        icon={<Trash2Icon color="secondary" />}
        onClick={() => {
          setOpenTrashDialog()
          handleCloseMenu()
        }}
        disabled={cantManageJourney}
      />
    </>
  )
}
