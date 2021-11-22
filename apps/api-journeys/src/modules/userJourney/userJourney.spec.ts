import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import { userJourneyModule } from '..'
import dbMock from '../../../tests/dbMock'
import { v4 as uuidv4 } from 'uuid'
import {
  User,
  ThemeName,
  UserJourney,
  Journey,
  ThemeMode
} from '.prisma/api-journeys-client'
import { DocumentNode, ExecutionResult } from 'graphql'

describe('UserJourneyModule', () => {
  let app

  beforeEach(() => {
    app = testkit.testModule(userJourneyModule, {
      schemaBuilder
    })
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
        const journey: Journey = {
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
        dbMock.journey.create.mockResolvedValue(journey)

        const user: User = {
          id: uuidv4(),
          firebaseId: 'yo',
          firstName: 'fo',
          lastName: 'sho',
          email: 'tho@no.co',
          imageUrl: 'po'
        }
        dbMock.user.create.mockResolvedValue(user)

        const userJourney: UserJourney = {
          userId: user.id,
          journeyId: journey.id,
          role: 'editor'
        }
        dbMock.userJourney.create.mockResolvedValue(userJourney)
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
              userId: user.id,
              journeyId: journey.id,
              role: 'editor'
            }
          }
        )
        expect(data?.userJourneyCreate).toEqual({
          userId: user.id,
          journeyId: journey.id,
          role: 'editor'
        })
      })
    })

    describe('userJourney', () => {
      it('updates a user journey', async () => {
        const userJourney: UserJourney = {
          userId: uuidv4(),
          journeyId: uuidv4(),
          role: 'owner'
        }
        dbMock.userJourney.update.mockResolvedValue(userJourney)
        const { data } = await query(
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
              role: 'owner'
            }
          }
        )
        expect(data?.userJourneyUpdate).toEqual({
          userId: userJourney.userId,
          journeyId: userJourney.journeyId,
          role: 'owner'
        })
      })
    })
  })
})
