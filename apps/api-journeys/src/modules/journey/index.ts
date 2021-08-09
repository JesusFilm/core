import { PrismaClient } from '.prisma/api-journeys-client'
import { createModule, gql } from 'graphql-modules'
import { JourneyModule } from './__generated__/types'

const typeDefs = gql`
  type Journey {
    id: ID!
    published: Boolean!
    title: String!
  }

  type Query {
    journeys: [Journey!]!
    journey(id: ID!): Journey
  }

  type Mutation {
    journeyCreate(title: String!): Journey!
    journeyPublish(id: ID!): Journey
  }
`

const client = new PrismaClient()

const resolvers: JourneyModule.Resolvers = {
  Query: {
    journeys () {
      return client.journey.findMany({
        where: { published: true }
      })
    },
    journey (_parent, { id }) {
      return client.journey.findFirst({
        where: { id }
      })
    }
  },
  Mutation: {
    journeyCreate (_parent, { title }) {
      return client.journey.create({
        data: {
          title
        }
      })
    },
    journeyPublish (_parent, { id }) {
      return client.journey.update({
        where: {
          id
        },
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
