import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import { userJourneyModule } from '..'
import dbMock from '../../../tests/dbMock'
import { v4 as uuidv4 } from 'uuid'
import { ThemeName, ThemeMode } from '.prisma/api-journeys-client'
import { DocumentNode, ExecutionResult, GraphQLError } from 'graphql'

describe('UserJourneyModule', () => {
  let app,
    user,
    userEditor,
    userInvited,
    journey,
    userJourneyEditor,
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
    userEditor = {
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

    userJourneyEditor = {
      userId: userEditor.id,
      journeyId: journey.id,
      role: 'editor'
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

      describe('Invites a user', () => {
        it('invites a user to a journey', async () => {
          dbMock.userJourney.create.mockResolvedValue(
            userJourneyInviteRequested
          )

          await query(
            gql`
              mutation ($input: UserJourneyRequestInput!) {
                userJourneyRequest(input: $input) {
                  userId
                  journeyId
                }
              }
            `,
            {
              input: {
                userId: userJourneyInviteRequested.userId,
                journeyId: userJourneyInviteRequested.journeyId
              }
            },
            {
              userId: user.id
            }
          )

          expect(dbMock.userJourney.create).toBeCalledWith({
            data: {
              userId: userJourneyInviteRequested.userId,
              journeyId: userJourneyInviteRequested.journeyId,
              role: 'inviteRequested'
            }
          })
        })
      })

      describe('User Journey Promote to Editor', () => {
        it('updates the user journey role to be editor with journey owner access', async () => {
          dbMock.userJourney.update.mockResolvedValue(
            userJourneyInviteRequested
          )
          dbMock.userJourney.findUnique.mockResolvedValue(userJourneyOwner)

          const { data } = await query(
            gql`
              mutation ($input: UserJourneyUpdateInput!) {
                userJourneyUpdate(input: $input) {
                  userId
                  journeyId
                }
              }
            `,
            {
              input: {
                userId: userJourneyInviteRequested.userId,
                journeyId: userJourneyInviteRequested.journeyId
              }
            },
            {
              userId: userJourneyOwner.userId
            }
          )

          expect(data?.userJourneyUpdate).toEqual({
            userId: userJourneyInviteRequested.userId,
            journeyId: userJourneyInviteRequested.journeyId
          })
          expect(dbMock.userJourney.update).toBeCalledWith({
            where: {
              uniqueUserJourney: {
                userId: userJourneyInviteRequested.userId,
                journeyId: userJourneyInviteRequested.journeyId
              }
            },
            data: {
              role: 'editor'
            }
          })
        })
        it('does not update a user journey by a non-owner', async () => {
          dbMock.userJourney.update.mockResolvedValue(
            userJourneyInviteRequested
          )
          dbMock.userJourney.findUnique.mockResolvedValue(userJourneyEditor)

          const { data, errors } = await query(
            gql`
              mutation ($input: UserJourneyUpdateInput!) {
                userJourneyUpdate(input: $input) {
                  userId
                  journeyId
                }
              }
            `,
            {
              input: {
                userId: userJourneyEditor.userId,
                journeyId: userJourneyEditor.journeyId
              }
            },
            {
              userId: userJourneyEditor.userId
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

      describe('User Journey Remove', () => {
        it('removes the editor from a journey with journey owner access', async () => {
          dbMock.userJourney.delete.mockResolvedValue(userJourneyEditor)
          dbMock.userJourney.findUnique.mockResolvedValue(userJourneyOwner)

          await query(
            gql`
              mutation ($input: UserJourneyRemoveInput!) {
                userJourneyRemove(input: $input) {
                  userId
                  journeyId
                  role
                }
              }
            `,
            {
              input: {
                userId: userJourneyEditor.userId,
                journeyId: userJourneyEditor.journeyId,
                role: userJourneyEditor.role
              }
            },
            {
              userId: userJourneyOwner.userId
            }
          )
          expect(dbMock.userJourney.delete).toBeCalledWith({
            where: {
              uniqueUserJourney: {
                userId: userJourneyEditor.userId,
                journeyId: userJourneyEditor.journeyId
              }
            }
          })
        })
        it('does not remove the editor from a journey with non-owner access', async () => {
          dbMock.userJourney.delete.mockResolvedValue(userJourneyEditor)

          const { data, errors } = await query(
            gql`
              mutation ($input: UserJourneyRemoveInput!) {
                userJourneyRemove(input: $input) {
                  userId
                  journeyId
                  role
                }
              }
            `,
            {
              input: {
                userId: userJourneyEditor.userId,
                journeyId: userJourneyEditor.journeyId,
                role: userJourneyEditor.role
              }
            },
            {
              userId: 'notOwnerId'
            }
          )

          expect(errors).toBeDefined()
          expect(errors).toEqual([
            new GraphQLError(
              'You do not own this journey so you cannot remove users'
            )
          ])
          expect(data?.userJourneyRemove).toEqual(undefined)
        })
      })

      describe('User Journey Promote', () => {
        it('promotes editor to owner', async () => {
          dbMock.userJourney.update.mockResolvedValue(userJourneyEditor)
          dbMock.userJourney.findUnique.mockResolvedValue(userJourneyOwner)

          await query(
            gql`
              mutation ($input: UserJourneyUpdateInput!) {
                userJourneyPromote(input: $input) {
                  userId
                  journeyId
                }
              }
            `,
            {
              input: {
                userId: userJourneyEditor.userId,
                journeyId: userJourneyEditor.journeyId
              }
            },
            {
              userId: userJourneyOwner.userId
            }
          )

          expect(dbMock.userJourney.update).toBeCalledWith({
            where: {
              uniqueUserJourney: {
                userId: userJourneyEditor.userId,
                journeyId: userJourneyEditor.journeyId
              }
            },
            data: {
              role: 'owner'
            }
          })
          expect(dbMock.userJourney.update).toBeCalledWith({
            where: {
              uniqueUserJourney: {
                userId: userJourneyOwner.userId,
                journeyId: userJourneyOwner.journeyId
              }
            },
            data: {
              role: 'editor'
            }
          })
        })
        it('does not promote editor to owner with non-owner access', async () => {
          dbMock.userJourney.update.mockResolvedValue(userJourneyEditor)

          const { data, errors } = await query(
            gql`
              mutation ($input: UserJourneyUpdateInput!) {
                userJourneyPromote(input: $input) {
                  userId
                  journeyId
                }
              }
            `,
            {
              input: {
                userId: userJourneyEditor.userId,
                journeyId: userJourneyEditor.journeyId
              }
            },
            {
              userId: 'notOwnerId'
            }
          )

          expect(errors).toBeDefined()
          expect(errors).toEqual([
            new GraphQLError(
              'You do not own this journey so you cannot change roles'
            )
          ])
          expect(data?.userJourneyPromote).toEqual(undefined)
        })
      })
    })
  })
})
