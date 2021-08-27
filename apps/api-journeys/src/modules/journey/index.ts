import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { JourneyModule } from './__generated__/types'

const typeDefs = gql`
  type Journey {
    id: ID!
    published: Boolean!
    title: String!
    blocks: [Block!]!
  }

  type Query {
    journeys: [Journey!]!
    journey(id: ID!): Journey
  }

  type Mutation {
    journeyCreate(title: String!): Journey!
    journeyPublish(id: ID!): Journey
  }

  union Block = StepBlock | VideoBlock | RadioQuestionBlock | RadioOptionBlock

  interface BaseBlock {
    id: ID!
    parent: Block
  }

  type StepBlock implements BaseBlock {
    id: ID!
    parent: Block
  }

  type VideoBlock implements BaseBlock {
    id: ID!
    parent: Block
    src: String!
    title: String!
    description: String
    provider: 'Youtube' | 'Vimeo' | 'Arclight'
  }

  type RadioQuestionBlock implements BaseBlock {
    id: ID!
    parent: Block
    ## Field suggestions to be added
    label: String!
    description: String!
    variant: 'light' | 'dark'
  }

  type RadioOptionBlock implements BaseBlock {
    id: ID!
    parent: Block
    ## Field suggestions to be added
    label: String!
    image: String!
  }
`

const resolvers: JourneyModule.Resolvers = {
  Query: {
    async journeys (_, __, { db }) {
      return await db.journey.findMany({
        where: { published: true }
      })
    },
    async journey (_parent, { id }, { db }) {
      return await db.journey.findUnique({
        where: { id }
      })
    }
  },
  Mutation: {
    async journeyCreate (_parent, { title }, { db }) {
      return await db.journey.create({
        data: {
          title
        }
      })
    },
    async journeyPublish (_parent, { id }, { db }) {
      return await db.journey.update({
        where: { id },
        data: {
          published: true
        }
      })
    }
  }
}

export default createModule({
  id: 'journey',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers
})
