import 'reflect-metadata'
import { createModule, gql, Resolvers } from 'graphql-modules'

const typeDefs = gql`
  extend type Journey {
    blocks: [Block!]
  }

  interface Block {
    id: ID!
    parent: Block
  }

  type StepBlock implements Block {
    id: ID!
    parent: Block
  }

  type VideoBlock implements Block {
    id: ID!
    parent: Block
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

  type RadioQuestionBlock implements Block {
    id: ID!
    parent: Block
    label: String!
    description: String!
    variant: 'light' | 'dark'
  }

  type RadioOptionBlock implements Block {
    id: ID!
    parent: Block
    ## Field suggestions to be added
    label: String!
    image: String!
  }
`
const resolvers: Resolvers = {
  Journey: {
    async blocks (journey, __, { db }) {
      return db.block.findMany({
        where: { journeyId: journey.id }
      })
    }
  },
  Block: {
    __resolveType: (obj, context, info) => {
      return obj.blockType
    }
  }
}

export default createModule({
  id: 'block',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers
})
