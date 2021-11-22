import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { UserJourneyModule } from './__generated__/types'

const typeDefs = gql`
  enum UserJourneyRole {
    inviteRequested
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
    role: UserJourneyRole!
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
  Mutation: {
    async userJourneyCreate(
      _parent,
      { input: { userId, journeyId, role } },
      { db }
    ) {
      return await db.userJourney.create({
        data: {
          userId: userId,
          journeyId: journeyId,
          role: role as UserJourneyModule.UserJourneyRole
        }
      })
    },
    async userJourneyUpdate(_parent, { input }, { db }) {
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
