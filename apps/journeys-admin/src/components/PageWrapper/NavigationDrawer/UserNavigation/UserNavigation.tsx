import { gql, useSuspenseQuery } from '@apollo/client'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import compact from 'lodash/compact'
import dynamic from 'next/dynamic'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { User } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { MouseEvent, ReactElement, useEffect, useState } from 'react'

import BoxIcon from '@core/shared/ui/icons/Box'
import UserProfile3Icon from '@core/shared/ui/icons/UserProfile3'

import { GetMe } from '../../../../../__generated__/GetMe'
import { JourneyStatus, Role } from '../../../../../__generated__/globalTypes'
import { useAdminJourneysSuspenseQuery } from '../../../../libs/useAdminJourneysSuspenseQuery'
import { useUserRoleSuspenseQuery } from '../../../../libs/useUserRoleSuspenseQuery'
import { getJourneyTooltip } from '../../utils/getJourneyTooltip'
import { JourneyTooltip } from '../../utils/getJourneyTooltip/getJourneyTooltip'

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
  query GetMe($input: MeInput) {
    me(input: $input) {
      id
      firstName
      lastName
      email
      imageUrl
      superAdmin
      emailVerified
    }
  }
`

interface UserNavigationProps {
  user: User
  selectedPage?: string
  setTooltip?: (value: string | undefined) => void
}

export function UserNavigation({
  user,
  selectedPage,
  setTooltip
}: UserNavigationProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const { data } = useSuspenseQuery<GetMe>(GET_ME, {
    variables: { input: { redirect: router?.query?.redirect } }
  })
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
        setTooltip?.(t('New Editing Request'))
        break
      case JourneyTooltip.newJourney:
        setTooltip?.(t('New Journey'))
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
      <Divider sx={{ mb: 0.5, mx: 6, borderColor: 'secondary.main' }} />
      {userRoleData?.getUserRole?.roles?.includes(Role.publisher) === true && (
        <ListItemButton
          LinkComponent={NextLink}
          href="/publisher"
          selected={selectedPage === 'publisher'}
          data-testid="NavigationListItemPublisher"
        >
          <ListItemIcon>
            <BoxIcon />
          </ListItemIcon>
          <ListItemText
            primary={t('Publisher')}
            primaryTypographyProps={{ style: { whiteSpace: 'nowrap' } }}
          />
        </ListItemButton>
      )}
      {data.me.superAdmin === true && (
        <ListItemButton
          data-testid="NavigationListItemImpersonate"
          onClick={handleImpersonateClick}
        >
          <ListItemIcon>
            <UserProfile3Icon />
          </ListItemIcon>
          <ListItemText
            primary={t('Impersonate')}
            primaryTypographyProps={{ style: { whiteSpace: 'nowrap' } }}
          />
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
        <ListItemText
          primary={t('Profile')}
          primaryTypographyProps={{ style: { whiteSpace: 'nowrap' } }}
        />
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
