import { ApolloQueryResult, gql, useQuery } from '@apollo/client'
import Divider from '@mui/material/Divider'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useMemo } from 'react'

import { useTeam } from '@core/journeys/ui/TeamProvider'
import { useUserRoleQuery } from '@core/journeys/ui/useUserRoleQuery'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import EyeOpenIcon from '@core/shared/ui/icons/EyeOpen'
import Globe2Icon from '@core/shared/ui/icons/Globe2'
import Trash2Icon from '@core/shared/ui/icons/Trash2'
import UsersProfiles2Icon from '@core/shared/ui/icons/UsersProfiles2'

import {
  GetAdminJourneys,
  GetAdminJourneys_journeys as Journey
} from '../../../../../../__generated__/GetAdminJourneys'
import {
  GetJourneyWithPermissions,
  GetJourneyWithPermissionsVariables
} from '../../../../../../__generated__/GetJourneyWithPermissions'
import {
  JourneyStatus,
  Role,
  UserJourneyRole,
  UserTeamRole
} from '../../../../../../__generated__/globalTypes'
import { useCurrentUserLazyQuery } from '../../../../../libs/useCurrentUserLazyQuery'
import { useCustomDomainsQuery } from '../../../../../libs/useCustomDomainsQuery'
import { useJourneyForSharingLazyQuery } from '../../../../../libs/useJourneyForShareLazyQuery'
import { GET_JOURNEY_WITH_PERMISSIONS } from '../../../../AccessDialog/AccessDialog'
import { ShareItem } from '../../../../Editor/Toolbar/Items/ShareItem/ShareItem'
import { MenuItem } from '../../../../MenuItem'
import { CopyToTeamMenuItem } from '../../../../Team/CopyToTeamMenuItem/CopyToTeamMenuItem'
import { DuplicateJourneyMenuItem } from '../DuplicateJourneyMenuItem'

import { ArchiveJourney } from './ArchiveJourney'

export const GET_JOURNEY_WITH_USER_ROLES = gql`
  query GetJourneyWithUserRoles($id: ID!) {
    adminJourney(id: $id, idType: databaseId) {
      id
      userJourneys {
        id
        role
        user {
          id
          email
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
  journey?: Journey
  published: boolean
  setOpenAccessDialog: () => void
  handleCloseMenu: () => void
  setOpenTrashDialog: () => void
  setOpenDetailsDialog: () => void
  setOpenTranslateDialog: () => void
  handleKeepMounted?: () => void
  template?: boolean
  refetch?: () => Promise<ApolloQueryResult<GetAdminJourneys>>
}

/**
 * DefaultMenu component provides a menu interface for journey management actions.
 * It includes options for editing details, managing access, previewing, duplicating,
 * copying to team, archiving, and deleting journeys based on user permissions.
 *
 * @param {Object} props - Component props
 * @param {string} props.id - The unique identifier for the journey
 * @param {string} props.slug - The URL slug for the journey used in preview links
 * @param {JourneyStatus} props.status - Current status of the journey (e.g., draft, published)
 * @param {string} props.journeyId - Database ID of the journey
 * @param {Journey} [props.journey] - Optional journey object containing additional journey data
 * @param {boolean} props.published - Whether the journey is published
 * @param {() => void} props.setOpenAccessDialog - Function to open the access management dialog
 * @param {() => void} props.handleCloseMenu - Function to close the menu
 * @param {() => void} props.setOpenTrashDialog - Function to open the trash confirmation dialog
 * @param {() => void} props.setOpenDetailsDialog - Function to open the journey details dialog
 * @param {() => void} props.setOpenTranslateDialog - Function to open the translate dialog
 * @param {() => void} [props.handleKeepMounted] - Optional function to handle keeping the component mounted
 * @param {boolean} [props.template] - Whether the journey is a template, affects available menu options
 * @param {() => Promise<ApolloQueryResult<GetAdminJourneys>>} [props.refetch] - Optional function to refetch journey data after operations
 * @returns {ReactElement} The rendered menu component with conditional menu items based on user permissions
 */
export function DefaultMenu({
  id,
  slug,
  status,
  journeyId,
  journey,
  published,
  setOpenAccessDialog,
  handleCloseMenu,
  setOpenTrashDialog,
  setOpenDetailsDialog,
  setOpenTranslateDialog,
  handleKeepMounted,
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

  // Lazy query for journey data if context is missing
  const [loadJourney, { data: journeyFromLazyQuery }] =
    useJourneyForSharingLazyQuery()

  const { data: journeyWithUserRoles } = useQuery<
    GetJourneyWithPermissions,
    GetJourneyWithPermissionsVariables
  >(GET_JOURNEY_WITH_PERMISSIONS, {
    variables: { id: journeyId }
  })

  const owner = useMemo(
    () =>
      journeyWithUserRoles?.journey?.userJourneys?.find(
        (userJourney) => userJourney.role === UserJourneyRole.owner
      ),
    [journeyWithUserRoles?.journey?.userJourneys]
  )
  const isOwner = useMemo(
    () => owner?.user?.email === currentUser?.email,
    [currentUser?.email, owner?.user?.email]
  )

  useEffect(() => {
    void loadUser()
  }, [loadUser])

  useEffect(() => {
    void loadJourney({ variables: { id: journeyId } })
  }, [loadJourney, journeyId])

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
    isOwner ||
    teamRole === UserTeamRole.manager ||
    (isPublisher && template === true)

  const cantManageJourney = !canManageJourney

  return (
    <>
      <MenuItem
        label={t('Edit Details')}
        icon={<Edit2Icon color="secondary" />}
        onClick={() => {
          setOpenDetailsDialog()
          handleCloseMenu()
        }}
      />
      <Divider />
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
        prefetch={false}
      >
        <MenuItem
          label={t('Preview')}
          icon={<EyeOpenIcon color="secondary" />}
          openInNew
        />
      </NextLink>
      <ShareItem
        variant="menu-item"
        journey={journeyFromLazyQuery?.journey}
        handleCloseMenu={handleCloseMenu}
        handleKeepMounted={handleKeepMounted}
      />
      <Divider />
      {template !== true && activeTeam != null && (
        <>
          <DuplicateJourneyMenuItem id={id} handleCloseMenu={handleCloseMenu} />
          <MenuItem
            label={t('Translate')}
            icon={<Globe2Icon color="secondary" />}
            onClick={() => {
              setOpenTranslateDialog()
              handleCloseMenu()
            }}
          />
        </>
      )}

      <Divider />
      <CopyToTeamMenuItem
        id={id}
        handleCloseMenu={handleCloseMenu}
        handleKeepMounted={handleKeepMounted}
        journey={journey}
      />
      {activeTeam != null && (
        <>
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
      )}
    </>
  )
}
