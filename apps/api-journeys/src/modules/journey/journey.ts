import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { JourneyModule } from './__generated__/types'
import { isNil, omitBy } from 'lodash'
import { AuthenticationError } from 'apollo-server-errors'

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
  }

  enum IdType {
    databaseId
    slug
  }

  extend type Query {
    journeys: [Journey!]!
    journey(id: ID!, idType: IdType): Journey
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
  }

  input JourneyUpdateInput {
    id: ID!
    title: String
    locale: String
    themeMode: ThemeMode
    themeName: ThemeName
    description: String
    primaryImageBlockId: ID
    slug: IdType
  }

  extend type Mutation {
    journeyCreate(input: JourneyCreateInput!): Journey!
    journeyUpdate(input: JourneyUpdateInput!): Journey!
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
    async journey(_parent, { id, idType }, { db }) {
      if (idType === 'slug') {
        return await db.journey.findUnique({ where: { slug: id } })
      } else {
        return await db.journey.findUnique({ where: { id } })
      }
    }
  },
  Mutation: {
    async journeyCreate(
      _parent,
      { input: { id, title, locale, themeMode, themeName, description } },
      { db, userId }
    ) {
      if (userId == null)
        throw new AuthenticationError('No user token provided')
      return await db.journey.create({
        data: {
          id: id as string | undefined,
          title,
          locale: locale ?? undefined,
          themeMode: themeMode ?? undefined,
          themeName: themeName ?? undefined,
          description
        }
      })
    },
    async journeyUpdate(_parent, { input }, { db, userId }) {
      if (userId == null)
        throw new AuthenticationError('No user token provided')
      return await db.journey.update({
        where: {
          id: input.id
        },
        data: {
          ...omitBy(input, isNil)
        }
      })
    },

    async journeyPublish(_parent, { id }, { db, userId }) {
      if (userId == null)
        throw new AuthenticationError('No user token provided')
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
