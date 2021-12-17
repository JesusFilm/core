import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { AuthenticationError } from 'apollo-server-errors'
import { UserModule } from './__generated__/types'

const typeDefs = gql`
  input UserCreateInput {
    firstName: String
    lastName: String
    email: String
    imageUrl: String
  }

  type User @key(fields: "id") {
    id: ID!
    firstName: String!
    lastName: String
    email: String!
    imageUrl: String
  }

  extend type UserJourney {
    user: User
  }

  extend type Query {
    me: User
    users: [User!]!
    user(id: ID!): User
  }

  extend type Mutation {
    userCreate(input: UserCreateInput!): User!
  }
`

const resolvers: UserModule.Resolvers = {
  UserJourney: {
    async user(userJourney, __, { db }) {
      const user = await db.user.findUnique({
        where: {
          id: userJourney.userId
        }
      })
      return user
    }
  },
  Query: {
    async users(_, __, { db }) {
      return await db.user.findMany({})
    },
    async user(_parent, { id }, { db }) {
      return await db.user.findUnique({ where: { id } })
    },
    async me(_parent, _, { db, userId }) {
      if (userId == null)
        throw new AuthenticationError(
          'You must be logged in to get your profile'
        )

      return await db.user.findUnique({ where: { id: userId } })
    }
  },
  Mutation: {
    async userCreate(
      _parent,
      { input: { firstName, lastName, email, imageUrl } },
      { db, userId }
    ) {
      if (userId == null) throw new AuthenticationError('You must be logged in')

      const user = await db.user.findUnique({
        where: {
          id: userId
        }
      })

      if (user != null) return user

      // are all of these properties required?
      // it's making us do a type check
      return await db.user.create({
        data: {
          id: userId,
          firstName: firstName as string,
          lastName: lastName as string,
          email: email as string,
          imageUrl: imageUrl as string
        }
      })
    }
  }
}

export const userModule = createModule({
  id: 'user',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers
})
