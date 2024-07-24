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

  it('should change integrationId of text response', async () => {
    const result = jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: selectedBlock.id,
          __typename: 'TextResponseBlock',
          routeId: 'route.id'
        }
      }
    }))

    render(
      <MockedProvider
        mocks={[
          getTeamsMock,
          getIntegrationMock,
          {
            request: {
              query: TEXT_RESPONSE_ROUTE_UPDATE,
              variables: {
                id: selectedBlock.id,
                input: {
                  routeId: 'route.id'
                }
              }
            },
            result
          }
        ]}
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
    expect(result).toHaveBeenCalled()
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
})
