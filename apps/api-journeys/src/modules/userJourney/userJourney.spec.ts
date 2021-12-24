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
      id: uuidv4(),
      userId: userEditor.id,
      journeyId: journey.id,
      role: 'editor'
    }

    userJourneyOwner = {
      id: uuidv4(),
      userId: user.id,
      journeyId: journey.id,
      role: 'owner'
    }

    userJourneyInviteRequested = {
      id: uuidv4(),
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
    describe('Invites a user', () => {
      it('invites a user to a journey', async () => {
        dbMock.userJourney.create.mockResolvedValue(userJourneyInviteRequested)

        await query(
          gql`
            mutation ($journeyId: ID!) {
              userJourneyRequest(journeyId: $journeyId) {
                journeyId
              }
            }
          `,
          {
            journeyId: userJourneyInviteRequested.journeyId
          },
          {
            userId: userJourneyInviteRequested.userId
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
        dbMock.userJourney.update.mockResolvedValue(userJourneyInviteRequested)
        dbMock.userJourney.findUnique.mockResolvedValue(userJourneyOwner)

        const { data } = await query(
          gql`
            mutation ($userJourneyApproveId: ID!) {
              userJourneyApprove(id: $userJourneyApproveId) {
                id
                journeyId
                userId
                role
              }
            }
          `,
          {
            userJourneyApproveId: userJourneyInviteRequested.id
          },
          {
            userId: userJourneyOwner.userId
          }
        )

        expect(data?.userJourneyApprove).toEqual({
          id: userJourneyInviteRequested.id,
          journeyId: userJourneyInviteRequested.journeyId,
          userId: userJourneyInviteRequested.userId,
          role: 'inviteRequested'
        })
        expect(dbMock.userJourney.update).toBeCalledWith({
          where: {
            id: userJourneyInviteRequested.id
          },
          data: {
            role: 'editor'
          }
        })
      })
      it('does not update a user journey by a non-owner', async () => {
        dbMock.userJourney.update.mockResolvedValue(userJourneyInviteRequested)
        dbMock.userJourney.findUnique.mockResolvedValue(userJourneyEditor)

        const { data, errors } = await query(
          gql`
            mutation ($userJourneyApproveId: ID!) {
              userJourneyApprove(id: $userJourneyApproveId) {
                id
                journeyId
                userId
                role
              }
            }
          `,
          {
            userJourneyApproveId: userJourneyInviteRequested.id
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
            mutation ($userJourneyRemoveId: ID!) {
              userJourneyRemove(id: $userJourneyRemoveId) {
                userId
                journeyId
                role
              }
            }
          `,
          {
            userJourneyRemoveId: userJourneyEditor.id
          },
          {
            userId: userJourneyOwner.userId
          }
        )
        expect(dbMock.userJourney.delete).toBeCalledWith({
          where: {
            id: userJourneyEditor.id
          }
        })
      })
      it('does not remove the editor from a journey with non-owner access', async () => {
        dbMock.userJourney.delete.mockResolvedValue(userJourneyEditor)
        dbMock.userJourney.findUnique.mockResolvedValue(
          userJourneyInviteRequested
        )

        const { data, errors } = await query(
          gql`
            mutation ($userJourneyRemoveId: ID!) {
              userJourneyRemove(id: $userJourneyRemoveId) {
                userId
                journeyId
                role
              }
            }
          `,
          {
            userJourneyRemoveId: userJourneyEditor.id
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
        dbMock.userJourney.update.mockResolvedValue(userJourneyOwner)
        dbMock.userJourney.findUnique.mockResolvedValue(userJourneyEditor)
        dbMock.userJourney.findUnique.mockResolvedValue(userJourneyOwner)

        const { data } = await query(
          gql`
            mutation ($userJourneyPromoteId: ID!) {
              userJourneyPromote(id: $userJourneyPromoteId) {
                journeyId
                role
              }
            }
          `,
          {
            userJourneyPromoteId: userJourneyEditor.id
          },
          {
            userId: userJourneyOwner.userId
          }
        )

        expect(data?.userJourneyPromote).toEqual({
          journeyId: userJourneyEditor.journeyId,
          role: 'owner'
        })
      })
      it('does not promote editor to owner with non-owner access', async () => {
        dbMock.userJourney.update.mockResolvedValue(userJourneyEditor)
        dbMock.userJourney.findUnique.mockResolvedValue(
          userJourneyInviteRequested
        )

        const { data, errors } = await query(
          gql`
            mutation ($userJourneyPromoteId: ID!) {
              userJourneyPromote(id: $userJourneyPromoteId) {
                userId
                journeyId
              }
            }
          `,
          {
            userJourneyPromoteId: userJourneyEditor.id
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
