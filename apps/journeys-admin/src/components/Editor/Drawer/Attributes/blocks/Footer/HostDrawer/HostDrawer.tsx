import { gql, useQuery } from '@apollo/client'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import { ReactElement, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { HostAvatars } from '@core/journeys/ui/StepFooter/HostAvatars'
import AlertCircleIcon from '@core/shared/ui/icons/AlertCircle'
import Edit2Icon from '@core/shared/ui/icons/Edit2'

import { UserTeamRole } from '../../../../../../../../__generated__/globalTypes'
import { useCurrentUserLazyQuery } from '../../../../../../../libs/useCurrentUserLazyQuery'
import { useUpdateJourneyHostMutation } from '../../../../../../../libs/useUpdateJourneyHostMutation'
import { useUserTeamsAndInvitesQuery } from '../../../../../../../libs/useUserTeamsAndInvitesQuery'
import { ContainedIconButton } from '../../../../../../ContainedIconButton'

import { HostFormDrawer } from './HostFormDrawer'

export const GET_ALL_TEAM_HOSTS = gql`
  query Hosts($teamId: ID!) {
    hosts(teamId: $teamId) {
      id
      location
      src1
      src2
      title
    }
  }
`

const HostListDrawer = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/Drawer/Attributes/blocks/Footer/HostDrawer/HostListDrawer/HostListDrawer" */ './HostListDrawer'
    ).then((mod) => mod.HostListDrawer),
  { ssr: false }
)

const HostInfoDrawer = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/Drawer/Attributes/blocks/Footer/HostDrawer/HostInfoDrawer/HostInfoDrawer" */ './HostInfoDrawer'
    ).then((mod) => mod.HostInfoDrawer),
  { ssr: false }
)

export function HostDrawer(): ReactElement {
  const [openSelect, setOpenSelect] = useState(false)
  const [openCreateHost, setOpenCreateHost] = useState(false)
  const [openInfo, setOpenInfo] = useState(false)
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  // Get all team members of journey team, check if user in team
  // TODO: Replace with CASL authorisation check
  const { loadUser, data: user } = useCurrentUserLazyQuery()
  const { data } = useUserTeamsAndInvitesQuery(
    journey?.team != null
      ? {
          teamId: journey?.team.id,
          where: { role: [UserTeamRole.manager, UserTeamRole.member] }
        }
      : undefined
  )
  const userInTeam =
    data == null || data.userTeams.length === 0 || journey?.team == null
      ? false
      : data.userTeams.find((userTeam) => userTeam.user.email === user.email) !=
        null
  // Fetch all hosts made for a team
  const { data: teamHosts, refetch } = useQuery(GET_ALL_TEAM_HOSTS, {
    variables: { teamId: journey?.team?.id },
    skip: journey?.team == null
  })
  const [journeyHostUpdate] = useUpdateJourneyHostMutation()

  useEffect(() => {
    void loadUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (journey?.team != null) void refetch({ teamId: journey.team.id })
  }, [journey?.team, refetch])

  async function handleClear(): Promise<void> {
    if (journey?.team != null) await refetch({ teamId: journey.team.id })
    await journeyHostUpdate({
      variables: { id: journey?.id, input: { hostId: null } }
    })
    setOpenSelect(false)
    setOpenCreateHost(false)
  }

  async function handleOpenCreateHost(): Promise<void> {
    await journeyHostUpdate({
      variables: { id: journey?.id, input: { hostId: null } }
    })
    setOpenCreateHost(true)
  }

  return (
    <>
      {journey?.host != null ? (
        <Stack sx={{ p: 4 }}>
          <ContainedIconButton
            label={journey.host.title}
            description={journey.host.location ?? ''}
            disabled={!userInTeam}
            slots={{
              ImageThumbnail: (
                <HostAvatars
                  size="small"
                  avatarSrc1={journey.host.src1}
                  avatarSrc2={journey.host.src2}
                  hasPlaceholder
                />
              )
            }}
            onClick={() => setOpenCreateHost(true)}
            actionIcon={<Edit2Icon />}
          />
        </Stack>
      ) : (
        <Stack sx={{ p: 4 }}>
          <ContainedIconButton
            label={t('Select a Host')}
            disabled={!userInTeam}
            slots={{
              ImageThumbnail: <HostAvatars size="large" hasPlaceholder />
            }}
            onClick={() => setOpenSelect(true)}
          />
        </Stack>
      )}
      {!userInTeam && journey?.team != null && (
        <Stack direction="row" alignItems="center" gap={3}>
          <AlertCircleIcon />
          <Typography variant="subtitle2">
            {data?.userTeams.length === 0
              ? t('Cannot edit hosts for this old journey')
              : t('Only {{teamName} members can edit this', {
                  teamName: journey.team.title
                })}
          </Typography>
        </Stack>
      )}
      <HostListDrawer
        openSelect={openSelect}
        teamHosts={teamHosts}
        onClose={() => setOpenSelect(false)}
        setOpenInfo={() => setOpenInfo(true)}
        handleOpenCreateHost={handleOpenCreateHost}
        handleSelectHost={() => setOpenSelect(false)}
      />
      <HostInfoDrawer openInfo={openInfo} onClose={() => setOpenInfo(false)} />
      <HostFormDrawer
        onClear={handleClear}
        open={openCreateHost}
        onClose={() => setOpenCreateHost(false)}
      />
    </>
  )
}
