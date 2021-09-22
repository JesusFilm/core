import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { JourneyModule } from './__generated__/types'

const typeDefs = gql`
  type Journey @key(fields: "id") {
    id: ID!
    published: Boolean!
    title: String!
    locale: String!
    theme: ThemeName!
  }

  enum ThemeName {
    default
  }

  extend type Query {
    journeys: [Journey!]!
    journey(id: ID!): Journey
  }

  extend type Mutation {
    journeyCreate(title: String!, locale: String, theme: ThemeName): Journey!
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
    async journeyCreate(_parent, { title, locale, theme }, { db }) {
      return await db.journey.create({
        data: {
          title,
          locale: locale as string ?? undefined,
          theme: theme ?? undefined
        }
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
