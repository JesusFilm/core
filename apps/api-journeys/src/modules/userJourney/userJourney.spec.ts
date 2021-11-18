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
import { pick } from 'lodash'

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

  describe('Query', () => {
    describe('userJourney', () => {
      it('returns user journey', async () => {
        const user: User = {
          id: uuidv4(),
          firebaseId: 'yo',
          firstName: 'fo',
          lastName: 'sho',
          email: 'tho@no.co',
          imageUrl: 'po'
        }
        dbMock.user.findMany.mockResolvedValue([user])

        const publishedJourney: Journey = {
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
        dbMock.journey.findMany.mockResolvedValue([publishedJourney])

        const userJourney: UserJourney = {
          userId: user.id,
          journeyId: publishedJourney.id,
          role: 'inviteRequested'
        }

        dbMock.userJourney.findMany.mockResolvedValue([userJourney])
        const { data } = await query(gql`
          query {
            userJourney {
              userId
              journeyId
              role
            }
          }
        `)
        expect(data?.userJourneys).toEqual([
          pick(userJourney, ['userId', 'journeyId', 'role'])
        ])
      })
    })
  })
})
