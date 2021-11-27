import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import { userJourneyModule } from '..'
import dbMock from '../../../tests/dbMock'
import { v4 as uuidv4 } from 'uuid'
import { ThemeName, UserJourney, ThemeMode } from '.prisma/api-journeys-client'
import { DocumentNode, ExecutionResult, GraphQLError } from 'graphql'

describe('UserJourneyModule', () => {
  let app,
    user,
    userInvited,
    journey,
    userJourneyOwner,
    userJourneyInviteRequested

  beforeEach(() => {
    app = testkit.testModule(userJourneyModule, {
      schemaBuilder
    })
    user = {
      id: uuidv4(),
      firstName: 'fo',
      lastName: 'sho',
      email: 'tho@no.co',
      imageUrl: 'po'
    }
    userInvited = {
      id: uuidv4(),
      firstName: 'fo',
      lastName: 'sho',
      email: 'tho@no.co',
      imageUrl: 'po'
    }
    journey = {
      id: uuidv4(),
      title: 'published',
      published: true,
      locale: 'id-ID',
      themeName: ThemeName.base,
      themeMode: ThemeMode.light,
      description: null,
      primaryImageBlockId: null,
      slug: 'published-slug'
    }

    userJourneyOwner = {
      userId: user.id,
      journeyId: journey.id,
      role: 'owner'
    }

    userJourneyInviteRequested = {
      userId: userInvited.id,
      journeyId: journey.id,
      role: 'inviteRequested'
    }
  })

  async function query(
    document: DocumentNode,
    variableValues?: { [key: string]: unknown },
    contextValue?: { [key: string]: unknown }
  ): Promise<ExecutionResult> {
    return await testkit.execute(app, {
      document,
      variableValues,
      contextValue: {
        ...contextValue,
        db: dbMock
      }
    })
  }

  describe('Mutation', () => {
    describe('userJourney', () => {
      it('creates a user journey', async () => {
        dbMock.journey.create.mockResolvedValue(journey)
        dbMock.user.create.mockResolvedValue(user)
        dbMock.user.create.mockResolvedValue(userInvited)
        dbMock.userJourney.create.mockResolvedValue(userJourneyOwner)
        dbMock.userJourney.create.mockResolvedValue(userJourneyInviteRequested)

        const { data } = await query(
          gql`
            mutation ($input: UserJourneyCreateInput!) {
              userJourneyCreate(input: $input) {
                userId
                journeyId
                role
              }
            }
          `,
          {
            input: {
              userId: userJourneyInviteRequested.userId,
              journeyId: userJourneyInviteRequested.journeyId,
              role: 'inviteRequested'
            }
          },
          {
            userId: user.id
          }
        )
        expect(data?.userJourneyCreate).toEqual({
          userId: userJourneyInviteRequested.userId,
          journeyId: userJourneyInviteRequested.journeyId,
          role: 'inviteRequested'
        })
      })
    })

    // describe('userJourney', () => {
    //   it('updates a user journey with journey owner', async () => {
    //     dbMock.journey.create.mockResolvedValue(journey)
    //     dbMock.user.create.mockResolvedValue(user)
    //     dbMock.user.create.mockResolvedValue(userInvited)
    //     dbMock.userJourney.create.mockResolvedValue(userJourneyOwner)
    //     dbMock.userJourney.create.mockResolvedValue(userJourneyInviteRequested)

    //     const { data } = await query(
    //       gql`
    //         mutation ($input: UserJourneyUpdateInput!) {
    //           userJourneyUpdate(input: $input) {
    //             userId
    //             journeyId
    //             role
    //           }
    //         }
    //       `,
    //       {
    //         input: {
    //           userId: userJourneyInviteRequested.userId,
    //           journeyId: userJourneyInviteRequested.journeyId,
    //           role: 'editor'
    //         }
    //       },
    //       {
    //         userId: userJourneyOwner.userId
    //       }
    //     )
    //     expect(data?.userJourneyUpdate).toEqual({
    //       userId: userJourneyInviteRequested.userId,
    //       journeyId: userJourneyInviteRequested.journeyId,
    //       role: 'editor'
    //     })
    //   })
    // })

    describe('userJourney', () => {
      it('does not update a user journey by a non-owner', async () => {
        const userJourney: UserJourney = {
          userId: uuidv4(),
          journeyId: uuidv4(),
          role: 'inviteRequested'
        }
        dbMock.userJourney.update.mockResolvedValue(userJourney)
        const { data, errors } = await query(
          gql`
            mutation ($input: UserJourneyUpdateInput!) {
              userJourneyUpdate(input: $input) {
                userId
                journeyId
                role
              }
            }
          `,
          {
            input: {
              userId: userJourney.userId,
              journeyId: userJourney.journeyId,
              role: 'editor'
            }
          },
          {
            userId: 'notownerid'
          }
        )
        expect(errors).toBeDefined()
        expect(errors).toEqual([
          new GraphQLError(
            'You do not own this journey so you cannot change roles'
          )
        ])
        expect(data?.userJourneyUpdate).toEqual(undefined)
      })
    })
  })
})
