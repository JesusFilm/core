import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../../__generated__/BlockFields'
import { GetLastActiveTeamIdAndTeams } from '../../../../../../../../../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { TextResponseType } from '../../../../../../../../../../../../__generated__/globalTypes'
import { JourneyFields as Journey } from '../../../../../../../../../../../../__generated__/JourneyFields'
import {
  TextResponseIntegrationUpdate,
  TextResponseIntegrationUpdateVariables
} from '../../../../../../../../../../../../__generated__/TextResponseIntegrationUpdate'
import { journeyUpdatedAtCacheUpdate } from '../../../../../../../../../../../libs/journeyUpdatedAtCacheUpdate'
import { getIntegrationMock } from '../../../../../../../../../../../libs/useIntegrationQuery/useIntegrationQuery.mock'
import { CommandRedoItem } from '../../../../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../../../../Toolbar/Items/CommandUndoItem'

import { TEXT_RESPONSE_INTEGRATION_UPDATE } from './App'

import { App } from '.'

jest.mock(
  '../../../../../../../../../../../libs/journeyUpdatedAtCacheUpdate',
  () => {
    return {
      journeyUpdatedAtCacheUpdate: jest.fn()
    }
  }
)

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

describe('App', () => {
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

  const integrationUpdateMock: MockedResponse<
    TextResponseIntegrationUpdate,
    TextResponseIntegrationUpdateVariables
  > = {
    request: {
      query: TEXT_RESPONSE_INTEGRATION_UPDATE,
      variables: {
        id: selectedBlock.id,
        integrationId: 'integration.id',
        routeId: null
      }
    },
    result: jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: selectedBlock.id,
          __typename: 'TextResponseBlock',
          integrationId: 'integration.id',
          routeId: null
        }
      }
    }))
  }

  const integrationUpdateMock2: MockedResponse<
    TextResponseIntegrationUpdate,
    TextResponseIntegrationUpdateVariables
  > = {
    request: {
      query: TEXT_RESPONSE_INTEGRATION_UPDATE,
      variables: {
        id: selectedBlock.id,
        integrationId: null,
        routeId: null
      }
    },
    result: jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: selectedBlock.id,
          __typename: 'TextResponseBlock',
          integrationId: null,
          routeId: null
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
        <JourneyProvider value={{ journey: {} as unknown as Journey }}>
          <EditorProvider initialState={{ selectedBlock }}>
            <TeamProvider>
              <App />
            </TeamProvider>
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    await waitFor(() => {
      expect(screen.getByText('Growth Spaces')).toBeInTheDocument()
    })
    fireEvent.mouseDown(screen.getByRole('combobox'))
    await waitFor(() =>
      fireEvent.click(screen.getByRole('option', { name: 'access.id' }))
    )
    expect(integrationUpdateMock.result).toHaveBeenCalled()
    await waitFor(() => expect(journeyUpdatedAtCacheUpdate).toHaveBeenCalled())
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
        <JourneyProvider value={{ journey: {} as unknown as Journey }}>
          <EditorProvider initialState={{ selectedBlock }}>
            <TeamProvider>
              <CommandUndoItem variant="button" />
              <App />
            </TeamProvider>
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    await waitFor(() => {
      expect(screen.getByText('Growth Spaces')).toBeInTheDocument()
    })
    fireEvent.mouseDown(screen.getByRole('combobox'))
    await waitFor(() =>
      fireEvent.click(screen.getByRole('option', { name: 'access.id' }))
    )
    await waitFor(() => expect(integrationUpdateMock.result).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() =>
      expect(integrationUpdateMock2.result).toHaveBeenCalled()
    )
    await waitFor(() => expect(journeyUpdatedAtCacheUpdate).toHaveBeenCalled())
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
        <JourneyProvider value={{ journey: {} as unknown as Journey }}>
          <EditorProvider initialState={{ selectedBlock }}>
            <TeamProvider>
              <CommandUndoItem variant="button" />
              <CommandRedoItem variant="button" />
              <App />
            </TeamProvider>
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    await waitFor(() => {
      expect(screen.getByText('Growth Spaces')).toBeInTheDocument()
    })
    fireEvent.mouseDown(screen.getByRole('combobox'))
    await waitFor(() =>
      fireEvent.click(screen.getByRole('option', { name: 'access.id' }))
    )
    await waitFor(() => expect(mockFirstUpdate.result).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() =>
      expect(integrationUpdateMock2.result).toHaveBeenCalled()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(mockFirstUpdate.result).toHaveBeenCalled())

    await waitFor(() => expect(journeyUpdatedAtCacheUpdate).toHaveBeenCalled())
  })
})
