import { gql, useQuery } from '@apollo/client'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import AlertCircleIcon from '@core/shared/ui/icons/AlertCircle'
import InformationCircleContainedIcon from '@core/shared/ui/icons/InformationCircleContained'
import UserProfileCircleIcon from '@core/shared/ui/icons/UserProfileCircle'
import UserProfiles2Icon from '@core/shared/ui/icons/UsersProfiles2'

import { UserTeamRole } from '../../../../../../../../__generated__/globalTypes'
import { Hosts_hosts as Host } from '../../../../../../../../__generated__/Hosts'
import { useCurrentUserLazyQuery } from '../../../../../../../libs/useCurrentUserLazyQuery'
import { useUserTeamsAndInvitesQuery } from '../../../../../../../libs/useUserTeamsAndInvitesQuery'
import { ContainedIconButton } from '../../../../../../ContainedIconButton'
import { SidePanel } from '../../../../../../PageWrapper/SidePanel'
import { SidePanelContainer } from '../../../../../../PageWrapper/SidePanelContainer'

import { HostForm } from './HostForm'
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
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()

  // Get all team members of journey team, check if user in team
  // TODO: Replace with CASL authorisation check
  const { loadUser, data: user } = useCurrentUserLazyQuery()
  useEffect(() => {
    void loadUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const team = journey?.team ?? undefined
  const { data } = useUserTeamsAndInvitesQuery(
    team != null
      ? {
          teamId: team.id,
          where: { role: [UserTeamRole.manager, UserTeamRole.member] }
        }
      : undefined
  )
  const userInTeam =
    data == null || data.userTeams.length === 0 || team == null
      ? false
      : data.userTeams.find((userTeam) => userTeam.user.email === user.email) !=
        null

  // Fetch all hosts made for a team
  const { data: teamHosts, refetch } = useQuery(GET_ALL_TEAM_HOSTS, {
    variables: { teamId: team?.id },
    skip: team == null
  })

  const [selectedHost, setSelectedHost] = useState<Host | undefined>(
    journey?.host ?? undefined
  )
  const [openSelect, setOpenSelect] = useState(false)
  const [openCreateHost, setOpenCreateHost] = useState(false)
  const [openInfo, setOpenInfo] = useState(false)

  useEffect(() => {
    if (team != null) {
      void refetch({ teamId: team.id })
    }
  }, [team, refetch])

  const handleClear = async (): Promise<void> => {
    if (team != null) await refetch({ teamId: team.id })
    setSelectedHost(undefined)
    setOpenSelect(false)
    setOpenCreateHost(false)
  }

  const handleSelectHost = async (hostId: string): Promise<void> => {
    setSelectedHost(teamHosts.hosts.find((host) => host.id === hostId))
    setOpenSelect(false)
  }

  return (
    <>
      {/* DefaultHostPanel - no host */}
      <SidePanel title={t('Hosted By')} open withAdminDrawer>
        {!openSelect && (selectedHost == null || !userInTeam) && (
          <>
            <SidePanelContainer border={!userInTeam}>
              <ContainedIconButton
                label={t('Select a Host')}
                disabled={!userInTeam}
                thumbnailIcon={<UserProfiles2Icon />}
                onClick={() => setOpenSelect(true)}
              />
            </SidePanelContainer>
            {!userInTeam && team != null && (
              <SidePanelContainer>
                <Stack direction="row" alignItems="center" gap={3}>
                  <AlertCircleIcon />
                  <Typography variant="subtitle2">
                    {data?.userTeams.length === 0
                      ? t('Cannot edit hosts for this old journey')
                      : `${t('Only')} ${team.title} ${t(
                          'members can edit this'
                        )}`}
                  </Typography>
                </Stack>
              </SidePanelContainer>
            )}
          </>
        )}
      </SidePanel>

      {/* SelectHostPanel */}
      <SidePanel
        title={t('Select a Host')}
        open={openSelect}
        withAdminDrawer
        onClose={() => setOpenSelect(false)}
        selectHostPanel
      >
        {openSelect && !openCreateHost && !openInfo && (
          <>
            <SidePanelContainer border={false}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack direction="row" alignItems="center">
                  <Typography variant="subtitle2">{t('Authors')}</Typography>
                  <IconButton
                    data-testid="info"
                    onClick={() => setOpenInfo(true)}
                  >
                    <InformationCircleContainedIcon />
                  </IconButton>
                </Stack>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setOpenCreateHost(true)}
                >
                  {t('Create New')}
                </Button>
              </Stack>
            </SidePanelContainer>
            <HostList
              hosts={teamHosts?.hosts ?? []}
              onItemClick={handleSelectHost}
            />
          </>
        )}
      </SidePanel>

      {/* InfoPanel */}
      <SidePanel
        title={t('Information')}
        open={openInfo}
        withAdminDrawer
        onClose={() => setOpenInfo(false)}
      >
        {openInfo && (
          <SidePanelContainer border={false}>
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
          </SidePanelContainer>
        )}
      </SidePanel>

      {/* Create / EditHostPanel */}
      {userInTeam && (openCreateHost || selectedHost != null) && (
        <HostForm
          onClear={handleClear}
          onClose={() => setOpenCreateHost(false)}
        />
      )}
    </>
  )
}
