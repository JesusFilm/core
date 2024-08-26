import { gql, useLazyQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import UserProfileCircleIcon from '@core/shared/ui/icons/UserProfileCircle'

import {
  GetAllTeamHosts,
  GetAllTeamHostsVariables
} from '../../../../../../../../__generated__/GetAllTeamHosts'
import { UserTeamRole } from '../../../../../../../../__generated__/globalTypes'
import { useCurrentUserLazyQuery } from '../../../../../../../libs/useCurrentUserLazyQuery'
import { useUserTeamsAndInvitesQuery } from '../../../../../../../libs/useUserTeamsAndInvitesQuery'
import { Accordion } from '../../Properties/Accordion'

import { HostSelection } from './HostSelection'

export const GET_ALL_TEAM_HOSTS = gql`
  query GetAllTeamHosts($teamId: ID!) {
    hosts(teamId: $teamId) {
      id
      location
      src1
      src2
      title
    }
  }
`

const HostList = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/Tab/Attributes/blocks/Footer/Host/HostList/HostList" */ './HostList'
    ).then((mod) => mod.HostList),
  { ssr: false }
)

const HostInfo = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/Tab/Attributes/blocks/Footer/Host/HostInfo/HostInfo" */ './HostInfo'
    ).then((mod) => mod.HostInfo),
  { ssr: false }
)

const HostForm = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/Tab/Attributes/blocks/Footer/Host/HostForm/HostForm" */ './HostForm'
    ).then((mod) => mod.HostForm),
  { ssr: false }
)

export function Host(): ReactElement {
  const [openHostSelection, setOpenHostSelection] = useState(true)
  const [openHostList, setOpenHostList] = useState(false)
  const [openHostForm, setOpenHostForm] = useState(false)
  const [openHostInfo, setOpenHostInfo] = useState(false)
  const { journey } = useJourney()
  const { t } = useTranslation('apps-journeys-admin')
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
  const [getAllTeamHosts, { data: teamHosts }] = useLazyQuery<
    GetAllTeamHosts,
    GetAllTeamHostsVariables
  >(GET_ALL_TEAM_HOSTS)

  useEffect(() => {
    void loadUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (journey?.team != null)
      void getAllTeamHosts({ variables: { teamId: journey.team.id } })
  }, [journey?.team, getAllTeamHosts])

  function handleSelection(
    selection: 'selection' | 'list' | 'form' | 'info'
  ): void {
    resetStates()
    switch (selection) {
      case 'selection':
        setOpenHostSelection(true)
        break
      case 'list':
        setOpenHostList(true)
        break
      case 'form':
        setOpenHostForm(true)
        break
      case 'info':
        setOpenHostInfo(true)
        break
    }
  }

  function resetStates(): void {
    setOpenHostSelection(false)
    setOpenHostList(false)
    setOpenHostForm(false)
    setOpenHostInfo(false)
  }

  return (
    <Accordion
      id="author details"
      icon={<UserProfileCircleIcon />}
      name={t('Author Details')}
    >
      <Box data-testid="Host">
        {openHostSelection && (
          <HostSelection
            data={data}
            userInTeam={userInTeam}
            handleSelection={handleSelection}
          />
        )}
        {openHostList && (
          <HostList teamHosts={teamHosts} handleSelection={handleSelection} />
        )}

        {openHostInfo && <HostInfo handleSelection={handleSelection} />}
        {openHostForm && (
          <HostForm
            handleSelection={handleSelection}
            getAllTeamHostsQuery={getAllTeamHosts}
          />
        )}
      </Box>
    </Accordion>
  )
}
