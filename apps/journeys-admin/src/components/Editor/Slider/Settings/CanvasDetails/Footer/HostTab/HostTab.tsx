import { gql, useLazyQuery } from '@apollo/client'
import dynamic from 'next/dynamic'
import { ReactElement, useEffect, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import {
  GetAllTeamHosts,
  GetAllTeamHostsVariables
} from '../../../../../../../../__generated__/GetAllTeamHosts'
import { UserTeamRole } from '../../../../../../../../__generated__/globalTypes'
import { useCurrentUserLazyQuery } from '../../../../../../../libs/useCurrentUserLazyQuery'
import { useUpdateJourneyHostMutation } from '../../../../../../../libs/useUpdateJourneyHostMutation'
import { useUserTeamsAndInvitesQuery } from '../../../../../../../libs/useUserTeamsAndInvitesQuery'

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
      /* webpackChunkName: "Editor/Tab/Attributes/blocks/Footer/HostTab/HostList/HostList" */ './HostList'
    ).then((mod) => mod.HostList),
  { ssr: false }
)

const HostInfo = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/Tab/Attributes/blocks/Footer/HostTab/HostInfo/HostInfo" */ './HostInfo'
    ).then((mod) => mod.HostInfo),
  { ssr: false }
)

const HostForm = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/Tab/Attributes/blocks/Footer/HostTab/HostForm/HostForm" */ './HostForm'
    ).then((mod) => mod.HostForm),
  { ssr: false }
)

export function HostTab(): ReactElement {
  const [selectHostBox, setSelectHostBox] = useState(true)
  const [openHostList, setOpenHostList] = useState(false)
  const [openHostForm, setOpenHostForm] = useState(false)
  const [openHostInfo, setOpenHostInfo] = useState(false)
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
  const [getAllTeamHosts, { data: teamHosts }] = useLazyQuery<
    GetAllTeamHosts,
    GetAllTeamHostsVariables
  >(GET_ALL_TEAM_HOSTS)
  const [journeyHostUpdate] = useUpdateJourneyHostMutation()

  useEffect(() => {
    void loadUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (journey?.team != null)
      void getAllTeamHosts({ variables: { teamId: journey.team.id } })
  }, [journey?.team, getAllTeamHosts])

  async function handleClear(): Promise<void> {
    if (journey?.id == null) return
    if (journey?.team != null)
      await getAllTeamHosts({ variables: { teamId: journey.team.id } })
    setOpenHostList(false)
    setOpenHostForm(false)
    await journeyHostUpdate({
      variables: { id: journey?.id, input: { hostId: null } }
    })
    setSelectHostBox(true)
  }

  async function handleOpenHostForm(): Promise<void> {
    if (journey?.id == null) return
    await journeyHostUpdate({
      variables: { id: journey?.id, input: { hostId: null } }
    })
    setOpenHostList(false)
    setOpenHostForm(true)
  }

  return (
    <>
      {selectHostBox && (
        <HostSelection
          data={data}
          userInTeam={userInTeam}
          setSelectHostBox={setSelectHostBox}
          setOpenHostForm={setOpenHostForm}
          setOpenHostList={setOpenHostList}
        />
      )}
      {openHostList && (
        <HostList
          teamHosts={teamHosts}
          handleOpenHostInfo={() => {
            setOpenHostList(false)
            setOpenHostInfo(true)
          }}
          handleOpenHostForm={handleOpenHostForm}
          handleSelectHost={() => {
            setOpenHostList(false)
            setSelectHostBox(true)
          }}
        />
      )}

      {openHostInfo && (
        <HostInfo
          onClose={() => {
            setOpenHostInfo(false)
            setOpenHostList(true)
          }}
        />
      )}
      {openHostForm && (
        <HostForm
          onClear={handleClear}
          onBack={() => {
            setOpenHostForm(false)
            setOpenHostList(true)
          }}
        />
      )}
    </>
  )
}
