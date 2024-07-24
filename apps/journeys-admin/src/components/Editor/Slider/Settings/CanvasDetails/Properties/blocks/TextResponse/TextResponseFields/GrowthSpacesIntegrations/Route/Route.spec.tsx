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
import { Route, TEXT_RESPONSE_ROUTE_UPDATE } from './Route'

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
    integrationId: 'integration.id',
    routeId: null,
    type: TextResponseType.freeForm,
    children: []
  }

  const routeUpdateMock = {
    request: {
      query: TEXT_RESPONSE_ROUTE_UPDATE,
      variables: {
        id: selectedBlock.id,
        input: {
          routeId: 'route.id'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: selectedBlock.id,
          __typename: 'TextResponseBlock',
          routeId: 'route.id'
        }
      }
    }))
  }

  const routeUpdateMock2 = {
    request: {
      query: TEXT_RESPONSE_ROUTE_UPDATE,
      variables: {
        id: selectedBlock.id,
        input: {
          routeId: null
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: selectedBlock.id,
          __typename: 'TextResponseBlock',
          routeId: null
        }
      }
    }))
  }

  it('should change routeId of text response', async () => {
    render(
      <MockedProvider
        mocks={[getTeamsMock, getIntegrationMock, routeUpdateMock]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <TeamProvider>
            <Route />
          </TeamProvider>
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Route')).toBeInTheDocument()
    fireEvent.mouseDown(screen.getByRole('button'))
    await waitFor(() =>
      fireEvent.click(screen.getByRole('option', { name: 'route.name' }))
    )
    expect(routeUpdateMock.result).toHaveBeenCalled()
  })

  it('should not render route select if integrationId is not set', () => {
    render(
      <MockedProvider mocks={[getTeamsMock]}>
        <EditorProvider
          initialState={{
            selectedBlock: { ...selectedBlock, integrationId: null }
          }}
        >
          <TeamProvider>
            <Route />
          </TeamProvider>
        </EditorProvider>
      </MockedProvider>
    )
    expect(screen.queryByText('Route')).not.toBeInTheDocument
  })

  it('should undo change to routeId', async () => {
    render(
      <MockedProvider
        mocks={[
          getTeamsMock,
          getIntegrationMock,
          routeUpdateMock,
          routeUpdateMock2
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <TeamProvider>
            <CommandUndoItem variant="button" />
            <Route />
          </TeamProvider>
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Route')).toBeInTheDocument()
    fireEvent.mouseDown(screen.getAllByRole('button')[1])
    await waitFor(() =>
      fireEvent.click(screen.getByRole('option', { name: 'route.name' }))
    )
    await waitFor(() => expect(routeUpdateMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(routeUpdateMock2.result).toHaveBeenCalled())
  })

  it('should redo the change to routeId that was undone', async () => {
    const mockFirstUpdate = {
      ...routeUpdateMock,
      maxUsageCount: 2
    }

    render(
      <MockedProvider
        mocks={[
          getTeamsMock,
          getIntegrationMock,
          mockFirstUpdate,
          routeUpdateMock2
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <TeamProvider>
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
            <Route />
          </TeamProvider>
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Route')).toBeInTheDocument()
    fireEvent.mouseDown(screen.getAllByRole('button')[2])
    await waitFor(() =>
      fireEvent.click(screen.getByRole('option', { name: 'route.name' }))
    )
    await waitFor(() => expect(mockFirstUpdate.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(routeUpdateMock2.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(mockFirstUpdate.result).toHaveBeenCalled())
  })
})
