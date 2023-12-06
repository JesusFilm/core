import { gql, useSuspenseQuery } from '@apollo/client'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import compact from 'lodash/compact'
import dynamic from 'next/dynamic'
import NextLink from 'next/link'
import { User } from 'next-firebase-auth'
import { MouseEvent, ReactElement, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import BoxIcon from '@core/shared/ui/icons/Box'
import UserProfile3Icon from '@core/shared/ui/icons/UserProfile3'

import { GetMe } from '../../../../../__generated__/GetMe'
import { JourneyStatus, Role } from '../../../../../__generated__/globalTypes'
import { useAdminJourneysSuspenseQuery } from '../../../../libs/useAdminJourneysSuspenseQuery'
import { useUserRoleSuspenseQuery } from '../../../../libs/useUserRoleSuspenseQuery'
import { getJourneyTooltip } from '../../utils/getJourneyTooltip'
import { JourneyTooltip } from '../../utils/getJourneyTooltip/getJourneyTooltip'

import { NavigationListItem } from './NavigationListItem'

const ImpersonateDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "ImpersonateDialog" */
      './ImpersonateDialog'
    ).then((mod) => mod.ImpersonateDialog),
  { ssr: false }
)

const UserMenu = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "UserMenu" */
      './UserMenu'
    ).then((mod) => mod.UserMenu),
  { ssr: false }
)

export const GET_ME = gql`
  query GetMe {
    me {
      id
      firstName
      lastName
      email
      imageUrl
      superAdmin
    }
  }
`

interface UserNavigationProps {
  user: User
  selectedPage?: string
  setTooltip: (value: string | undefined) => void
}

export function UserNavigation({
  user,
  selectedPage,
  setTooltip
}: UserNavigationProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const { data } = useSuspenseQuery<GetMe>(GET_ME)
  const { data: userRoleData } = useUserRoleSuspenseQuery()
  const { data: journeysData } = useAdminJourneysSuspenseQuery({
    status: [JourneyStatus.draft, JourneyStatus.published],
    useLastActiveTeamId: true
  })
  const [profileAnchorEl, setProfileAnchorEl] = useState<
    HTMLDivElement | null | undefined
  >()
  const [impersonateOpen, setImpersonateOpen] = useState<boolean | undefined>()
  const profileOpen = Boolean(profileAnchorEl)

  useEffect(() => {
    switch (
      user.id != null
        ? getJourneyTooltip(journeysData.journeys, user.id)
        : undefined
    ) {
      case JourneyTooltip.newEditingRequest:
        setTooltip(t('New Editing Request'))
        break
      case JourneyTooltip.newJourney:
        setTooltip(t('New Journey'))
        break
    }
  }, [journeysData.journeys, user.id, t, setTooltip])
  function handleImpersonateClick(): void {
    setImpersonateOpen(true)
  }

  function handleImpersonateClose(): void {
    setImpersonateOpen(false)
  }

  function handleProfileClick(event: MouseEvent<HTMLDivElement>): void {
    setProfileAnchorEl(event.currentTarget)
  }

  function handleProfileClose(): void {
    setProfileAnchorEl(null)
  }

  return user.id != null && data.me != null ? (
    <>
      <Divider sx={{ mb: 2, mx: 6, borderColor: 'secondary.main' }} />
      {userRoleData?.getUserRole?.roles?.includes(Role.publisher) === true && (
        <NextLink href="/publisher" passHref legacyBehavior prefetch={false}>
          <ListItemButton
            selected={selectedPage === 'publisher'}
            data-testid="NavigationListItemPublisher"
          >
            <ListItemIcon>
              <BoxIcon />
            </ListItemIcon>
            <ListItemText primary={t('Publisher')} />
          </ListItemButton>
        </NextLink>
      )}
      {data.me.superAdmin === true && (
        <ListItemButton
          data-testid="NavigationListItemImpersonate"
          onClick={handleImpersonateClick}
        >
          <ListItemIcon>
            <UserProfile3Icon />
          </ListItemIcon>
          <ListItemText primary={t('Impersonate')} />
        </ListItemButton>
      )}
      <ListItemButton
        data-testid="NavigationListItemProfile"
        onClick={handleProfileClick}
      >
        <ListItemIcon>
          <Avatar
            alt={compact([data.me.firstName, data.me.lastName]).join(' ')}
            src={data.me.imageUrl ?? undefined}
            sx={{ width: 24, height: 24 }}
          />
        </ListItemIcon>
        <ListItemText primary={t('Profile')} />
      </ListItemButton>
      {profileAnchorEl !== undefined && (
        <UserMenu
          apiUser={data.me}
          profileOpen={profileOpen}
          profileAnchorEl={profileAnchorEl}
          handleProfileClose={handleProfileClose}
          user={user}
        />
      )}
      {impersonateOpen != null && (
        <ImpersonateDialog
          open={impersonateOpen}
          onClose={handleImpersonateClose}
        />
      )}
    </>
  ) : null
}
