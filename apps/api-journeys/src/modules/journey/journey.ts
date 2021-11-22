import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { JourneyModule } from './__generated__/types'
import { isNil, omitBy, get } from 'lodash'
import { AuthenticationError, UserInputError } from 'apollo-server-errors'
import { Prisma } from '.prisma/api-journeys-client'
import slugify from 'slugify'

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
    slug: String!
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
    """
    Slug should be unique amongst all journeys
    (server will throw BAD_USER_INPUT error if not)
    """
    slug: String!
  }

  input JourneyUpdateInput {
    id: ID!
    title: String
    locale: String
    themeMode: ThemeMode
    themeName: ThemeName
    description: String
    primaryImageBlockId: ID
    slug: String
  }

  extend type Mutation {
    journeyCreate(input: JourneyCreateInput!): Journey!
    journeyUpdate(input: JourneyUpdateInput!): Journey!
    journeyPublish(id: ID!): Journey
  }

  extend type NavigateToJourneyAction {
    journey: Journey
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
      { input: { id, title, locale, themeMode, themeName, description, slug } },
      { db, userId }
    ) {
      if (userId == null)
        throw new AuthenticationError('No user token provided')
      try {
        return await db.journey.create({
          data: {
            id: id as string | undefined,
            title,
            locale: locale ?? undefined,
            themeMode: themeMode ?? undefined,
            themeName: themeName ?? undefined,
            description,
            slug: slugify(slug ?? title, { remove: /[*+~.()'"!:@#]/g })
          }
        })
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2002' &&
          (get(e.meta, 'target') as string[]).includes('slug')
        ) {
          throw new UserInputError(e.message, {
            argumentName: 'slug'
          })
        }
        throw e
      }
    },
    async journeyUpdate(_parent, { input }, { db, userId }) {
      if (userId == null)
        throw new AuthenticationError('No user token provided')
      try {
        if (input.slug != null) {
          input.slug = slugify(input.slug, { remove: /[*+~.()'"!:@]#/g })
        }

        return await db.journey.update({
          where: {
            id: input.id
          },
          data: {
            ...omitBy(input, isNil)
          }
        })
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2002' &&
          (get(e.meta, 'target') as string[]).includes('slug')
        ) {
          throw new UserInputError(e.message, {
            argumentName: 'slug'
          })
        }
        throw e
      }
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
  },
  NavigateToJourneyAction: {
    journey: async ({ journeyId }, _, { db }) => {
      return await db.journey.findUnique({ where: { id: journeyId } })
    }
  }
}

export const journeyModule = createModule({
  id: 'journey',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers
})
