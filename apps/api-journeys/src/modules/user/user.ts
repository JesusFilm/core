import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { AuthenticationError } from 'apollo-server-errors'
import { UserModule } from './__generated__/types'
import { firebaseClient } from '../../lib/firebaseClient'

const typeDefs = gql`
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
    async me(_, __, { db, userId: id }) {
      if (id == null) throw new AuthenticationError('You must be logged in')

      const existingUser = await db.user.findUnique({
        where: {
          id
        }
      })

      if (existingUser != null) return existingUser

      const {
        displayName,
        email,
        photoURL: imageUrl
      } = await firebaseClient.auth().getUser(id)

      const firstName = displayName?.split(' ')?.slice(0, -1)?.join(' ') ?? ''
      const lastName = displayName?.split(' ')?.slice(-1)?.join(' ') ?? ''

      return await db.user.create({
        data: {
          id,
          firstName,
          lastName,
          email: email ?? '',
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
