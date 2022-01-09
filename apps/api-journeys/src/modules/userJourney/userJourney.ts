import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { UserJourneyModule } from './__generated__/types'
import { AuthenticationError, UserInputError } from 'apollo-server-errors'

const typeDefs = gql`
  enum UserJourneyRole {
    inviteRequested
    editor
    owner
  }

  extend type Journey {
    userJourneys: [UserJourney!]
  }

  type UserJourney {
    id: ID!
    userId: ID!
    journeyId: ID!
    role: UserJourneyRole!
  }

  extend type Mutation {
    userJourneyApprove(id: ID!): UserJourney!
    userJourneyPromote(id: ID!): UserJourney!
    userJourneyRemove(id: ID!): UserJourney!
    userJourneyRequest(journeyId: ID!): UserJourney!
  }
`

const resolvers: UserJourneyModule.Resolvers = {
  Journey: {
    async userJourneys(journey, __, { db }) {
      const userJourneys = await db.userJourney.findMany({
        where: {
          journeyId: journey.id
        }
      })
      return userJourneys
    }
  },
  Mutation: {
    async userJourneyRequest(_parent, { journeyId }, { db, userId }) {
      if (userId == null)
        throw new AuthenticationError('No user token provided')

      const journey = await db.journey.findUnique({
        where: { id: journeyId }
      })

      if (journey === null) throw new UserInputError('Journey not found')

      return await db.userJourney.create({
        data: {
          userId,
          journeyId,
          role: 'inviteRequested'
        }
      })
    },
    async userJourneyApprove(_parent, { id }, { db, userId }) {
      if (userId == null)
        throw new AuthenticationError('No user token provided')

      const userJourney = await db.userJourney.findUnique({ where: { id } })

      if (userJourney === null)
        throw new UserInputError('User journey not found')

      // can only update user journey roles if you are the journey's owner.
      const actor = await db.userJourney.findUnique({
        where: {
          uniqueUserJourney: {
            userId,
            journeyId: userJourney.journeyId
          }
        }
      })

      if (actor === null || actor?.role !== 'owner')
        throw new AuthenticationError(
          'You do not own this journey so you cannot change roles'
        )

      return await db.userJourney.update({
        where: {
          id
        },
        data: {
          role: 'editor'
        }
      })
    },
    async userJourneyRemove(_parent, { id }, { db, userId }) {
      if (userId == null)
        throw new AuthenticationError('No user token provided')

      const userJourney = await db.userJourney.findUnique({ where: { id } })

      if (userJourney === null)
        throw new UserInputError('User journey not found')

      // can only remove user if you are the journey's owner.
      const actor = await db.userJourney.findUnique({
        where: {
          uniqueUserJourney: {
            userId,
            journeyId: userJourney.journeyId
          }
        }
      })

      if (actor === null || actor?.role !== 'owner')
        throw new AuthenticationError(
          'You do not own this journey so you cannot remove users'
        )

      return await db.userJourney.delete({
        where: {
          id
        }
      })
    },
    async userJourneyPromote(_parent, { id }, { db, userId }) {
      if (userId == null)
        throw new AuthenticationError('No user token provided')

      const userJourney = await db.userJourney.findUnique({ where: { id } })

      if (userJourney === null)
        throw new UserInputError('User journey not found')

      // can only promote an editor to owner if you are the journey's owner.
      const actor = await db.userJourney.findUnique({
        where: {
          uniqueUserJourney: {
            userId,
            journeyId: userJourney.journeyId
          }
        }
      })

      if (actor === null || actor?.role !== 'owner')
        throw new AuthenticationError(
          'You do not own this journey so you cannot change roles'
        )

      if (
        userJourney.role !== 'editor' &&
        userJourney.role !== 'inviteRequested'
      )
        return actor

      const newOwner = await db.userJourney.update({
        where: {
          id
        },
        data: {
          role: 'owner'
        }
      })

      await db.userJourney.update({
        where: {
          id: actor.id
        },
        data: {
          role: 'editor'
        }
      })
      return newOwner
    }
  }
}

export const userJourneyModule = createModule({
  id: 'userJourney',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers
})
