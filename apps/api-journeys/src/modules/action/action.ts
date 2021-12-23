import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { ActionResolvers } from '../../__generated__/types'
import { ActionModule } from './__generated__/types'

const typeDefs = gql`
  interface Action {
    gtmEventName: String
  }

  """
  NavigateAction is an Action that navigates to the nextBlockId field set on the
  closest ancestor StepBlock.
  """
  type NavigateAction implements Action {
    gtmEventName: String
  }

  type NavigateToBlockAction implements Action {
    gtmEventName: String
    blockId: String!
  }

  type NavigateToJourneyAction implements Action {
    gtmEventName: String
    journeyId: String!
  }

  type LinkAction implements Action {
    gtmEventName: String
    url: String!
    target: String
  }
`

const resolvers: { Action: ActionResolvers } = {
  Action: {
    __resolveType(action) {
      if ((action as ActionModule.NavigateToBlockAction).blockId != null) {
        return 'NavigateToBlockAction'
      }
      if ((action as ActionModule.NavigateToJourneyAction).journeyId != null) {
        return 'NavigateToJourneyAction'
      }
      if ((action as ActionModule.LinkAction).url != null) {
        return 'LinkAction'
      }
      return 'NavigateAction'
    }
  }
}

export const actionModule = createModule({
  id: 'action',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers
})
