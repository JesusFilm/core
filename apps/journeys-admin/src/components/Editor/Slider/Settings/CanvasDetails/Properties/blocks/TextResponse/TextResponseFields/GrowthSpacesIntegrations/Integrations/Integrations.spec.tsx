import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'
import { TreeBlock } from '@core/journeys/ui/block'
import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../../__generated__/BlockFields'
import { GetLastActiveTeamIdAndTeams } from '../../../../../../../../../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { TextResponseType } from '../../../../../../../../../../../../__generated__/globalTypes'
import { getIntegrationMock } from '../../../../../../../../../../../libs/useIntegrationQuery/useIntegrationQuery.mock'
import { CommandRedoItem } from '../../../../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../../../../Toolbar/Items/CommandUndoItem'

import { Integrations, TEXT_RESPONSE_INTEGRATION_UPDATE } from './Integrations'

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

describe('Integrations', () => {
  const selectedBlock: TreeBlock<TextResponseBlock> = {
    __typename: 'TextResponseBlock',
    id: 'textResponse0.id',
    parentBlockId: '0',
    parentOrder: 0,
    label: 'Your answer here',
    hint: null,
    minRows: null,
    integrationId: null,
    routeId: null,
    type: TextResponseType.freeForm,
    children: []
  }

  const integrationUpdateMock = {
    request: {
      query: TEXT_RESPONSE_INTEGRATION_UPDATE,
      variables: {
        id: selectedBlock.id,
        input: {
          integrationId: 'integration.id'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: selectedBlock.id,
          __typename: 'TextResponseBlock',
          integrationId: 'integration.id'
        }
      }
    }))
  }

  const integrationUpdateMock2 = {
    request: {
      query: TEXT_RESPONSE_INTEGRATION_UPDATE,
      variables: {
        id: selectedBlock.id,
        input: {
          integrationId: null
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: selectedBlock.id,
          __typename: 'TextResponseBlock',
          integrationId: null
        }
      }
    }))
  }

  beforeEach(() => jest.clearAllMocks())

  it('should change integrationId of text response', async () => {
    render(
      <MockedProvider
        mocks={[getTeamsMock, getIntegrationMock, integrationUpdateMock]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <TeamProvider>
            <Integrations />
          </TeamProvider>
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Growth Spaces Integrations')).toBeInTheDocument()
    fireEvent.mouseDown(screen.getByRole('button'))
    await waitFor(() =>
      fireEvent.click(
        screen.getByRole('option', { name: 'growthSpaces - access.secret' })
      )
    )
    expect(integrationUpdateMock.result).toHaveBeenCalled()
  })

  it('should undo change to integration', async () => {
    render(
      <MockedProvider
        mocks={[
          getTeamsMock,
          getIntegrationMock,
          integrationUpdateMock,
          integrationUpdateMock2
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <TeamProvider>
            <CommandUndoItem variant="button" />
            <Integrations />
          </TeamProvider>
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Growth Spaces Integrations')).toBeInTheDocument()
    fireEvent.mouseDown(screen.getAllByRole('button')[1])
    await waitFor(() =>
      fireEvent.click(
        screen.getByRole('option', { name: 'growthSpaces - access.secret' })
      )
    )
    await waitFor(() => expect(integrationUpdateMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() =>
      expect(integrationUpdateMock2.result).toHaveBeenCalled()
    )
  })

  it('should redo the change to integration that was undone', async () => {
    const mockFirstUpdate = {
      ...integrationUpdateMock,
      maxUsageCount: 2
    }

    render(
      <MockedProvider
        mocks={[
          getTeamsMock,
          getIntegrationMock,
          mockFirstUpdate,
          integrationUpdateMock2
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <TeamProvider>
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
            <Integrations />
          </TeamProvider>
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Growth Spaces Integrations')).toBeInTheDocument()
    fireEvent.mouseDown(screen.getAllByRole('button')[2])
    await waitFor(() =>
      fireEvent.click(
        screen.getByRole('option', { name: 'growthSpaces - access.secret' })
      )
    )
    await waitFor(() => expect(mockFirstUpdate.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() =>
      expect(integrationUpdateMock2.result).toHaveBeenCalled()
    )

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(mockFirstUpdate.result).toHaveBeenCalled())
  })
})
