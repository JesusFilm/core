import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { JourneyModule } from './__generated__/types'

const typeDefs = gql`
  enum ThemeMode {
    light
    dark
  }

  enum ThemeName {
    base
  }

  type Journey @key(fields: "id") {
    id: ID!
    published: Boolean!
    title: String!
    locale: String!
    themeMode: ThemeMode!
    themeName: ThemeName!
    description: String
    primaryImageBlockId: ID!
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
    themeMode: ThemeMode
    themeName: ThemeName
    description: String
    primaryImageBlockId: ID
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
    async journeyCreate(
      _parent,
      { input: { id, title, locale, themeMode, themeName, description, primaryImageBlockId } },
      { db }
    ) {
      return await db.journey.create({
        data: {
          id: id as string | undefined,
          title,
          locale: locale ?? undefined,
          themeMode: themeMode ?? undefined,
          themeName: themeName ?? undefined,
          description: description as string,
          primaryImageBlockId: primaryImageBlockId as string | undefined 
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

export const journeyModule = createModule({
  id: 'journey',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers
})
