import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { BlockModule } from './__generated__/types'
import { ActionResolvers, BlockResolvers } from '../../__generated__/types'
import { get } from 'lodash'

const typeDefs = gql`
  extend type Journey {
    blocks: [Block!]
  }

  interface Block {
    id: ID!
    parentBlockId: ID
  }

  type StepBlock implements Block {
    id: ID!
    """
    nextBlockId contains the preferred block to navigate to when a
    NavigateAction occurs or if the user manually tries to advance to the next
    step. If no nextBlockId is set it can be assumed that this step represents
    the end of the current journey.
    """
    nextBlockId: ID
    """
    locked will be set to true if the user should not be able to manually
    advance to the next step.
    """
    locked: Boolean!
    parentBlockId: ID
  }

  type VideoBlock implements Block {
    id: ID!
    parentBlockId: ID
    src: String!
    title: String!
    description: String
    volume: Int
    autoplay: Boolean
  }

  enum RadioQuestionVariant {
    LIGHT
    DARK
  }

  type RadioQuestionBlock implements Block {
    id: ID!
    parentBlockId: ID
    label: String!
    description: String
    variant: RadioQuestionVariant
  }

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

  type RadioOptionBlock implements Block {
    id: ID!
    parentBlockId: ID
    label: String!
    action: Action
  }

  type SignupBlock implements Block {
    id: ID!
    parentBlockId: ID
  }

  extend type RadioQuestionResponse {
    block: RadioQuestionBlock!
  }

  extend type SignupResponse {
    block: SignupBlock!
  }

  extend type VideoResponse {
    block: VideoBlock!
  }
`

type Resolvers = BlockModule.Resolvers & {
  Action: ActionResolvers
  Block: BlockResolvers
}

const resolvers: Resolvers = {
  Journey: {
    async blocks(journey, __, { db }) {
      return await db.block.findMany({
        where: { journeyId: journey.id },
        orderBy: [{ parentOrder: 'asc' }]
      })
    }
  },
  Action: {
    __resolveType(action) {
      if ((action as BlockModule.NavigateToBlockAction).blockId != null) {
        return 'NavigateToBlockAction'
      }
      if ((action as BlockModule.NavigateToJourneyAction).journeyId != null) {
        return 'NavigateToJourneyAction'
      }
      if ((action as BlockModule.LinkAction).url != null) {
        return 'LinkAction'
      }
      return 'NavigateAction'
    }
  },
  Block: {
    __resolveType: ({ blockType }) => blockType
  },
  StepBlock: {
    locked: ({ extraAttrs }) => get(extraAttrs, 'locked'),
    nextBlockId: ({ extraAttrs }) => get(extraAttrs, 'nextBlockId')
  },
  VideoBlock: {
    src: ({ extraAttrs }) => get(extraAttrs, 'src'),
    title: ({ extraAttrs }) => get(extraAttrs, 'title')
  },
  RadioQuestionBlock: {
    label: ({ extraAttrs }) => get(extraAttrs, 'label'),
    description: ({ extraAttrs }) => get(extraAttrs, 'description'),
    variant: ({ extraAttrs }) => get(extraAttrs, 'variant')
  },
  RadioOptionBlock: {
    label: ({ extraAttrs }) => get(extraAttrs, 'label'),
    action: ({ extraAttrs }) => get(extraAttrs, 'action')
  }
}

export default createModule({
  id: 'block',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers
})
