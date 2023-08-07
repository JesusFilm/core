import { gql, useQuery } from '@apollo/client'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import InformationCircleContainedIcon from '@core/shared/ui/icons/InformationCircleContained'
import UserProfileCircleIcon from '@core/shared/ui/icons/UserProfileCircle'
import UserProfiles2Icon from '@core/shared/ui/icons/UsersProfiles2'

import { Hosts_hosts as Host } from '../../../../../../../../__generated__/Hosts'
import { ContainedIconButton } from '../../../../../../ContainedIconButton'
import { SidePanel } from '../../../../../../NewPageWrapper/SidePanel'
import { SidePanelContainer } from '../../../../../../NewPageWrapper/SidePanelContainer'

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
  const { data, refetch } = useQuery(GET_ALL_TEAM_HOSTS, {
    variables: { teamId: journey?.team?.id },
    skip: journey?.team == null
  })
  const team = journey?.team ?? undefined
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
    setSelectedHost(data.hosts.find((host) => host.id === hostId))
    setOpenSelect(false)
  }

  return (
    <>
      {/* DefaultHostPanel - no host */}
      <SidePanel title={t('Hosted By')} open edit>
        {!openSelect && selectedHost == null && (
          <SidePanelContainer border={false}>
            <ContainedIconButton
              label={t('Select a Host')}
              thumbnailIcon={<UserProfiles2Icon />}
              onClick={() => setOpenSelect(true)}
            />
          </SidePanelContainer>
        )}
      </SidePanel>

      {/* SelectHostPanel */}
      <SidePanel
        title={t('Select a Host')}
        open={openSelect}
        edit
        onClose={() => setOpenSelect(false)}
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
              hosts={data?.hosts ?? []}
              onItemClick={handleSelectHost}
            />
          </>
        )}
      </SidePanel>

      {/* InfoPanel */}
      <SidePanel
        title={t('Information')}
        open={openInfo}
        edit
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
      {(openCreateHost || selectedHost != null) && (
        <SidePanel title={t('Hosted By')} edit>
          <HostForm onClear={handleClear} />
        </SidePanel>
      )}
    </>
  )
}
