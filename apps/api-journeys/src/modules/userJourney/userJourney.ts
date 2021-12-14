import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { UserJourneyModule } from './__generated__/types'
import { AuthenticationError } from 'apollo-server-errors'
// import { PrismaPromise, PrismaClient } from '.prisma/api-journeys-client'
// import { UserJourney } from '../../__generated__/types'

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

  enum UserJourneyPromote {
    editor
    owner
  }

  input UserJourneyCreateInput {
    userId: ID!
    journeyId: ID!
    role: UserJourneyRole
  }

  input UserJourneyUpdateInput {
    userId: ID!
    journeyId: ID!
  }

  input UserJourneyRemoveInput {
    userId: ID!
    journeyId: ID!
    role: UserJourneyRoleForUpdates!
  }

  input UserJourneyRequestInput {
    userId: ID!
    journeyId: ID!
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
    userJourneyPromote(input: UserJourneyUpdateInput!): UserJourney!
    userJourneyRemove(input: UserJourneyRemoveInput!): UserJourney!
    userJourneyRequest(input: UserJourneyRequestInput!): UserJourney!
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
    async userJourneyCreate(_parent, { input }, { db, userId }) {
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
    async userJourneyRequest(_parent, { input }, { db, userId }) {
      if (userId == null)
        throw new AuthenticationError('No user token provided')

      return await db.userJourney.create({
        data: {
          userId: input.userId,
          journeyId: input.journeyId,
          role: 'inviteRequested'
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
          }
        }
      })

      if (actor === null || actor?.role !== 'owner')
        throw new AuthenticationError(
          'You do not own this journey so you cannot change roles'
        )

      return await db.userJourney.update({
        where: {
          uniqueUserJourney: {
            userId: input.userId,
            journeyId: input.journeyId
          }
        },
        data: {
          role: 'editor'
        }
      })
    },
    async userJourneyRemove(_parent, { input }, { db, userId }) {
      if (userId == null)
        throw new AuthenticationError('No user token provided')

      // can only remove user if you are the journey's owner.
      const actor = await db.userJourney.findUnique({
        where: {
          uniqueUserJourney: {
            userId: userId,
            journeyId: input.journeyId
          }
        }
      })

      if (actor === null || actor?.role !== 'owner')
        throw new AuthenticationError(
          'You do not own this journey so you cannot remove users'
        )

      if (input.role === (actor.role as UserJourneyModule.UserJourneyRole))
        throw new AuthenticationError(
          'Owners cannot remove themselves from their journey'
        )

      return await db.userJourney.delete({
        where: {
          uniqueUserJourney: {
            userId: input.userId,
            journeyId: input.journeyId
          }
        }
      })
    },
    async userJourneyPromote(_parent, { input }, { db, userId }) {
      if (userId == null)
        throw new AuthenticationError('No user token provided')

      // can only promote an editor to owner if you are the journey's owner.
      const actor = await db.userJourney.findUnique({
        where: {
          uniqueUserJourney: {
            userId: userId,
            journeyId: input.journeyId
          }
        }
      })

      if (actor === null || actor?.role !== 'owner')
        throw new AuthenticationError(
          'You do not own this journey so you cannot change roles'
        )

      if (actor.role === 'owner' && actor.journeyId === input.journeyId)
        throw new Error("You're already the owner of this journey")

      const newOwner = await db.userJourney.update({
        where: {
          uniqueUserJourney: {
            userId: input.userId,
            journeyId: input.journeyId
          }
        },
        data: {
          role: 'owner'
        }
      })

      await db.userJourney.update({
        where: {
          uniqueUserJourney: {
            userId: actor.userId,
            journeyId: actor.journeyId
          }
        },
        data: {
          role: 'editor'
        }
      })
      return newOwner

      // ideally done within a transaction but not sure how to do that with prisma
      // there seems to be a typescript problem

      // return await db.$transaction(
      //   async (
      //     db: PrismaClient
      //   ): Promise<Prisma.Prisma__UserJourneyClient<UserJourney>> => {
      //     await db.userJourney.update({
      //       where: {
      //         uniqueUserJourney: {
      //           userId: actor.userId,
      //           journeyId: actor.journeyId
      //         }
      //       },
      //       data: {
      //         role: 'editor'
      //       }
      //     })

      //     const newOwner = db.userJourney.update({
      //       where: {
      //         uniqueUserJourney: {
      //           userId: input.userId,
      //           journeyId: input.journeyId
      //         }
      //       },
      //       data: {
      //         role: 'owner'
      //       }
      //     })

      //     return newOwner
      //   }
      // )
    }
  }
}

export const userJourneyModule = createModule({
  id: 'userJourney',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers
})
