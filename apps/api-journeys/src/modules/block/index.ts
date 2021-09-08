import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { Prisma } from '.prisma/api-journeys-client'
import { Block, Resolvers } from '../../__generated__/types'

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

  type VideoBlock implements Block {
    id: ID!
    parentBlockId: ID
    src: String!
    title: String!
    description: String
    provider: VideoProviderEnum
  }

  enum VideoProviderEnum {
    YOUTUBE
    VIMEO
    ARCLIGHT
  }

  enum RadioQuestionVariant {
    LIGHT
    DARK
  }

  type RadioQuestionBlock implements Block {
    id: ID!
    parentBlockId: ID
    label: String!
    description: String!
    variant: RadioQuestionVariant
  }

  type RadioOptionBlock implements Block {
    id: ID!
    parentBlockId: ID
    ## Field suggestions to be added
    label: String!
    image: String
  }
`

const resolvers: Resolvers = {
  Journey: {
    async blocks(journey, __, { db }) {
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
  }
}

export default createModule({
  id: 'block',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers
})
