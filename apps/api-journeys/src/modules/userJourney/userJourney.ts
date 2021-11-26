import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { UserJourneyModule } from './__generated__/types'
import { AuthenticationError } from 'apollo-server-errors'

const typeDefs = gql`
  enum UserJourneyRole {
    inviteRequested
    editor
    owner
  }

  enum UserJourneyRoleForUpdates {
    inviteRequested
    editor
  }

  input UserJourneyCreateInput {
    userId: ID!
    journeyId: ID!
    role: UserJourneyRole
  }

  input UserJourneyUpdateInput {
    userId: ID!
    journeyId: ID!
    role: UserJourneyRoleForUpdates!
  }

  extend type Journey {
    usersJourneys: [UserJourney!]
  }

  extend type User {
    usersJourneys: [UserJourney!]
  }

  type UserJourney {
    userId: ID!
    journeyId: ID!
    role: UserJourneyRole!
  }

  extend type Mutation {
    userJourneyCreate(input: UserJourneyCreateInput!): UserJourney!
    userJourneyUpdate(input: UserJourneyUpdateInput!): UserJourney!
  }
`

const resolvers: UserJourneyModule.Resolvers = {
  Journey: {
    async usersJourneys(journey, __, { db }) {
      const usersJourneys = await db.userJourney.findMany({
        where: {
          journeyId: journey.id
        }
      })
      return usersJourneys
    }
  },
  User: {
    async usersJourneys(user, __, { db }) {
      const usersJourneys = await db.userJourney.findMany({
        where: {
          userId: user.id
        }
      })
      return usersJourneys
    }
  },
  Mutation: {
    async userJourneyCreate(
      _parent,
      { input },
      { db, userId }
    ) {
      if (userId == null)
        throw new AuthenticationError('No user token provided')

      return await db.userJourney.create({
        data: {
          userId: input.userId,
          journeyId: input.journeyId,
          role: input.role as UserJourneyModule.UserJourneyRole
        }
      })
    },
    async userJourneyUpdate(_parent, { input }, { db, userId }) {
      if (userId == null)
        throw new AuthenticationError('No user token provided')

      // can only update user journey roles if you are the journey's owner. 
      const actor = await db.userJourney.findUnique({
        where: {
          uniqueUserJourney: {
            userId: userId,
            journeyId: input.journeyId
          },
        }
      })

      if (actor === null || actor?.role !== "owner")
        throw new AuthenticationError('You do not own this journey so you cannot change roles')

      return await db.userJourney.update({
        where: {
          uniqueUserJourney: {
            userId: input.userId,
            journeyId: input.journeyId
          }
        },
        data: {
          role: input.role
        }
      })
    }
  }
}

export const userJourneyModule = createModule({
  id: 'userJourney',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers
})
