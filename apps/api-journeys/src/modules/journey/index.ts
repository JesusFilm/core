import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { JourneyModule } from './__generated__/types'

const typeDefs = gql`
  type Journey @key(fields: "id") {
    id: ID!
    published: Boolean!
    title: String!
    locale: String!
    themeName: ThemeName!
    themeMode: ThemeMode!
  }

  enum ThemeName {
    base
  }

  enum ThemeMode {
    light
    dark
  }

  extend type Query {
    journeys: [Journey!]!
    journey(id: ID!): Journey
  }

  input JourneyCreateInput {
    """
    ID should be unique Response UUID
    (Provided for optimistic mutation result matching)
    """
    id: ID
    title: String!
    locale: String
    themeName: ThemeName
    themeMode: ThemeMode
  }

  extend type Mutation {
    journeyCreate(input: JourneyCreateInput!): Journey!
    journeyPublish(id: ID!): Journey
  }
`

const resolvers: JourneyModule.Resolvers = {
  Query: {
    async journeys(_, __, { db }) {
      return await db.journey.findMany({
        where: { published: true }
      })
    },
    async journey(_parent, { id }, { db }) {
      return await db.journey.findUnique({
        where: { id }
      })
    }
  },
  Mutation: {
    async journeyCreate(_parent, { input }, { db }) {
      return await db.journey.create({
        data: input
      })
    },
    async journeyPublish(_parent, { id }, { db }) {
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
