import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { AuthenticationError } from 'apollo-server-errors'
import { UserModule } from './__generated__/types'

const typeDefs = gql`
  enum UserIdType {
    databaseId
    firebaseId
  }

  input UserCreateInput {
    id: ID
    firebaseId: ID
    firstName: String
    lastName: String
    email: String
    imageUrl: String
  }

  type User @key(fields: "id") {
    id: ID!
    firebaseId: ID
    firstName: String
    lastName: String
    email: String
    imageUrl: String
  }

  extend type UserJourney {
    user: User
  }

  extend type Query {
    users: [User!]!
    user(id: ID!, userIdType: UserIdType): User
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
    async user(_parent, { id, userIdType }, { db }) {
      if (userIdType === 'firebaseId') {
        return await db.user.findUnique({ where: { firebaseId: id } })
      } else {
        return await db.user.findUnique({ where: { id } })
      }
    }
  },
  Mutation: {
    async userCreate(
      _parent,
      { input: { id, firebaseId, firstName, lastName, email, imageUrl } },
      { db, userId }
    ) {
      if (userId == null)
        throw new AuthenticationError('No user token provided')

      return await db.user.create({
        data: {
          id: id as string | undefined,
          firebaseId: firebaseId as string,
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
