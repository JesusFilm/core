import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { Prisma } from '.prisma/api-journeys-client'
import { Block, NavigateAction, NavigateToJourneyAction, Resolvers } from '../../__generated__/types'

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
    parentBlockId: ID
  }

  enum VideoProviderEnum {
    YOUTUBE
    VIMEO
    ARCLIGHT
  }

  type VideoBlock implements Block {
    id: ID!
    parentBlockId: ID
    src: String!
    title: String!
    description: String
    provider: VideoProviderEnum
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

  type NavigateAction implements Action {
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
`

const resolvers: Resolvers = {
  Journey: {
    async blocks (journey, __, { db }) {
      const blocks = await db.block.findMany({
        where: { journeyId: journey.id },
        orderBy: [{ parentOrder: 'asc' }]
      })
      return blocks.map((block) => ({
        ...block,
        ...(block.extraAttrs as Prisma.JsonObject),
        __typename: block.blockType
      })) as Block[]
    }
  },
  Action: {
    __resolveType (obj) {
      if ((obj as NavigateAction).blockId != null) {
        return 'NavigateAction'
      }
      if ((obj as NavigateToJourneyAction).journeyId != null) {
        return 'NavigateToJourneyAction'
      }
      return 'LinkAction'
    }
  }
}

export default createModule({
  id: 'block',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers
})
