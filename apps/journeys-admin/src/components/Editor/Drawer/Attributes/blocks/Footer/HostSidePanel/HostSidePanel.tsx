import { gql, useMutation, useQuery } from '@apollo/client'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { HostAvatars } from '@core/journeys/ui/StepFooter/HostAvatars'
import AlertCircleIcon from '@core/shared/ui/icons/AlertCircle'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import InformationCircleContainedIcon from '@core/shared/ui/icons/InformationCircleContained'
import UserProfileCircleIcon from '@core/shared/ui/icons/UserProfileCircle'

import { UserTeamRole } from '../../../../../../../../__generated__/globalTypes'
import { Hosts_hosts as Host } from '../../../../../../../../__generated__/Hosts'
import { UpdateJourneyHost } from '../../../../../../../../__generated__/UpdateJourneyHost'
import { useCurrentUserLazyQuery } from '../../../../../../../libs/useCurrentUserLazyQuery'
import { useUserTeamsAndInvitesQuery } from '../../../../../../../libs/useUserTeamsAndInvitesQuery'
import { ContainedIconButton } from '../../../../../../ContainedIconButton'
import { Drawer } from '../../../../Drawer'

import { HostForm } from './HostForm'
import { UPDATE_JOURNEY_HOST } from './HostForm/HostTitleFieldForm/HostTitleFieldForm'
import { HostList } from './HostList'

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

export function HostSidePanel(): ReactElement {
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
  const [journeyHostUpdate] =
    useMutation<UpdateJourneyHost>(UPDATE_JOURNEY_HOST)

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
  async function handleSelectHost(hostId: string): Promise<void> {
    setOpenSelect(false)
  }
  async function handleOpenCreateHost(): Promise<void> {
    await journeyHostUpdate({
      variables: { id: journey?.id, input: { hostId: null } }
    })
    setOpenCreateHost(true)
  }

  return (
    <>
      {!openSelect && (
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
        </>
      )}
      <Drawer
        title={t('Select a Host')}
        open={openSelect}
        onClose={() => setOpenSelect(false)}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ p: 4, pb: 0 }}
        >
          <Stack direction="row" alignItems="center">
            <Typography variant="subtitle2">{t('Hosts')}</Typography>
            <IconButton data-testid="info" onClick={() => setOpenInfo(true)}>
              <InformationCircleContainedIcon />
            </IconButton>
          </Stack>
          <Button
            variant="outlined"
            size="small"
            onClick={handleOpenCreateHost}
          >
            {t('Create New')}
          </Button>
        </Stack>

        <HostList
          hosts={teamHosts?.hosts ?? []}
          onItemClick={handleSelectHost}
        />
      </Drawer>
      <Drawer
        title={t('Information')}
        open={openInfo}
        onClose={() => setOpenInfo(false)}
      >
        <Stack sx={{ p: 4 }}>
          <Stack direction="row" alignItems="center" gap={3} sx={{ mb: 4 }}>
            <UserProfileCircleIcon />
            <Typography variant="subtitle2">
              {t('Why does your journey need a host?')}
            </Typography>
          </Stack>
          <Typography gutterBottom color="secondary.light">
            {t(
              'A great way to add personality to your content is to include both male and female journey creators. Diverse creators, especially with a local feel, are more likely to engage users in conversation.'
            )}
          </Typography>
          <Typography color="secondary.light">
            {t(
              'In countries with security concerns, it is advisable to create fake personas for your own safety.'
            )}
          </Typography>
        </Stack>
      </Drawer>
      <HostForm
        onClear={handleClear}
        open={openCreateHost}
        onClose={() => setOpenCreateHost(false)}
      />
    </>
  )
}
