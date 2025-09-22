import { FetchResult } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../../__generated__/BlockFields'
import { GetIntegration } from '../../../../../../../../../../../../__generated__/GetIntegration'
import { GetLastActiveTeamIdAndTeams } from '../../../../../../../../../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { TextResponseType } from '../../../../../../../../../../../../__generated__/globalTypes'
import {
  TextResponseRouteUpdate,
  TextResponseRouteUpdateVariables
} from '../../../../../../../../../../../../__generated__/TextResponseRouteUpdate'
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

describe('Route', () => {
  const selectedBlock: TreeBlock<TextResponseBlock> = {
    __typename: 'TextResponseBlock',
    id: 'textResponse0.id',
    parentBlockId: '0',
    parentOrder: 0,
    label: 'Your answer here',
    placeholder: null,
    hint: null,
    minRows: null,
    integrationId: 'integration.id',
    routeId: null,
    type: TextResponseType.freeForm,
    required: null,
    children: [],
    hideLabel: false
  }

  const routeUpdateMock: MockedResponse<
    TextResponseRouteUpdate,
    TextResponseRouteUpdateVariables
  > = {
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

  const routeUpdateMock2: MockedResponse<
    TextResponseRouteUpdate,
    TextResponseRouteUpdateVariables
  > = {
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
    const result = jest.fn(() => getIntegrationMock.result)
    render(
      <MockedProvider
        mocks={[
          getTeamsMock,
          {
            ...getIntegrationMock,
            result: result as FetchResult<GetIntegration>
          },
          routeUpdateMock
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <TeamProvider>
            <Route />
          </TeamProvider>
        </EditorProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.mouseDown(screen.getByRole('combobox'))
    await waitFor(() =>
      fireEvent.click(screen.getByRole('option', { name: 'My First Email' }))
    )
    expect(routeUpdateMock.result).toHaveBeenCalled()
  })

  it('should not render route select if integrationId is not set', async () => {
    const result = jest.fn(() => getIntegrationMock.result)
    render(
      <MockedProvider
        mocks={[
          getTeamsMock,
          {
            ...getIntegrationMock,
            result: result as FetchResult<GetIntegration>
          }
        ]}
      >
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
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(screen.queryByText('Route')).not.toBeInTheDocument()
  })

  it('should undo change to routeId', async () => {
    const result = jest.fn(() => getIntegrationMock.result)
    render(
      <MockedProvider
        mocks={[
          getTeamsMock,

          {
            ...getIntegrationMock,
            result: result as FetchResult<GetIntegration>
          },
          routeUpdateMock,
          routeUpdateMock2
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <TeamProvider>
            <Route />
            <CommandUndoItem variant="button" />
          </TeamProvider>
        </EditorProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.mouseDown(screen.getAllByRole('combobox')[0])
    await waitFor(() =>
      fireEvent.click(screen.getByRole('option', { name: 'My First Email' }))
    )
    await waitFor(() => expect(routeUpdateMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(routeUpdateMock2.result).toHaveBeenCalled())
  })

  it('should redo the change to routeId that was undone', async () => {
    const result = jest.fn(() => getIntegrationMock.result)
    const mockFirstUpdate = {
      ...routeUpdateMock,
      maxUsageCount: 2
    }

    render(
      <MockedProvider
        mocks={[
          getTeamsMock,

          {
            ...getIntegrationMock,
            result: result as FetchResult<GetIntegration>
          },
          mockFirstUpdate,
          routeUpdateMock2
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <TeamProvider>
            <Route />
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
          </TeamProvider>
        </EditorProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.mouseDown(screen.getAllByRole('combobox')[0])
    await waitFor(() =>
      fireEvent.click(screen.getByRole('option', { name: 'My First Email' }))
    )
    await waitFor(() => expect(mockFirstUpdate.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(routeUpdateMock2.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(mockFirstUpdate.result).toHaveBeenCalled())
  })
})
