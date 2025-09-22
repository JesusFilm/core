import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../__generated__/BlockFields'
import { GetLastActiveTeamIdAndTeams } from '../../../../../../../../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { TextResponseType } from '../../../../../../../../../../../__generated__/globalTypes'
import { getIntegrationMock } from '../../../../../../../../../../libs/useIntegrationQuery/useIntegrationQuery.mock'

import { GrowthSpacesIntegrations } from '.'

describe('GrowthSpacesIntegrations', () => {
  const getTeamsMock: MockedResponse<GetLastActiveTeamIdAndTeams> = {
    request: {
      query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
    },
    result: {
      data: {
        getJourneyProfile: {
          __typename: 'JourneyProfile',
          id: 'journeyProfileId',
          lastActiveTeamId: 'team.id'
        },
        teams: [
          {
            __typename: 'Team',
            id: 'team.id',
            title: 'my first team',
            publicTitle: null,
            userTeams: [],
            customDomains: []
          }
        ]
      }
    }
  }
  const selectedBlock: TreeBlock<TextResponseBlock> = {
    __typename: 'TextResponseBlock',
    id: 'textResponse0.id',
    parentBlockId: '0',
    parentOrder: 0,
    label: 'Your answer here',
    placeholder: null,
    hint: null,
    minRows: null,
    integrationId: null,
    routeId: null,
    type: TextResponseType.email,
    required: null,
    children: [],
    hideLabel: true
  }

  describe('Email', () => {
    it('should render Growth Spaces Integrations if type is email', async () => {
      render(
        <MockedProvider mocks={[getTeamsMock, getIntegrationMock]}>
          <EditorProvider initialState={{ selectedBlock }}>
            <TeamProvider>
              <GrowthSpacesIntegrations />
            </TeamProvider>
          </EditorProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(screen.getByText('Growth Spaces')).toBeInTheDocument()
      )
    })

    it('should render Routes if integrationId is set', async () => {
      const selectedBlockWithIntegrationId: TreeBlock<TextResponseBlock> = {
        ...selectedBlock,
        integrationId: 'integration.id'
      }
      render(
        <MockedProvider mocks={[getTeamsMock, getIntegrationMock]}>
          <EditorProvider
            initialState={{ selectedBlock: selectedBlockWithIntegrationId }}
          >
            <TeamProvider>
              <GrowthSpacesIntegrations />
            </TeamProvider>
          </EditorProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(screen.getByText('Growth Spaces')).toBeInTheDocument()
      )
      await waitFor(() =>
        expect(screen.getAllByText('Route')[0]).toBeInTheDocument()
      )
    })
  })

  describe('Name', () => {
    it('should render Growth Spaces Integrations if type is name', async () => {
      render(
        <MockedProvider mocks={[getTeamsMock, getIntegrationMock]}>
          <EditorProvider
            initialState={{
              selectedBlock: { ...selectedBlock, type: TextResponseType.name }
            }}
          >
            <TeamProvider>
              <GrowthSpacesIntegrations />
            </TeamProvider>
          </EditorProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(screen.getByText('Growth Spaces')).toBeInTheDocument()
      )
    })

    it('should render Routes if integrationId is set', async () => {
      const selectedBlockWithIntegrationId: TreeBlock<TextResponseBlock> = {
        ...selectedBlock,
        type: TextResponseType.name,
        integrationId: 'integration.id'
      }
      render(
        <MockedProvider mocks={[getTeamsMock, getIntegrationMock]}>
          <EditorProvider
            initialState={{ selectedBlock: selectedBlockWithIntegrationId }}
          >
            <TeamProvider>
              <GrowthSpacesIntegrations />
            </TeamProvider>
          </EditorProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(screen.getByText('Growth Spaces')).toBeInTheDocument()
      )
      await waitFor(() =>
        expect(screen.getAllByText('Route')[0]).toBeInTheDocument()
      )
    })
  })
})
