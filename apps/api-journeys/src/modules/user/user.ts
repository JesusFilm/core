import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { AuthenticationError } from 'apollo-server-errors'
import { UserModule } from './__generated__/types'
import * as admin from 'firebase-admin'

if (
  process.env.GOOGLE_APPLICATION_JSON != null &&
  process.env.GOOGLE_APPLICATION_JSON !== ''
) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.GOOGLE_APPLICATION_JSON)
    )
  })
}

const typeDefs = gql`
  input UserCreateInput {
    firstName: String
    lastName: String
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
    users: [User]
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
    async users(_, __, { db, userId }) {
      if (userId == null)
        throw new AuthenticationError('You must be logged in to view users')

      return await db.user.findMany({})
    },
    async user(_parent, { id }, { db, userId }) {
      if (userId == null)
        throw new AuthenticationError('You must be logged in to view this user')

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
      { input: { firstName, lastName, imageUrl } },
      { db, userId }
    ) {
      if (userId == null) throw new AuthenticationError('You must be logged in')

      const auth = admin.auth()
      const user = await auth.getUser(userId)

      const existingUser = await db.user.findUnique({
        where: {
          id: userId
        }
      })

      if (existingUser != null) return existingUser

      return await db.user.create({
        data: {
          id: userId,
          firstName: firstName ?? '',
          lastName,
          email: user.email ?? '',
          imageUrl
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
