import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import { userModule } from '..'
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

describe('UserModule', () => {
  let app

  beforeEach(() => {
    app = testkit.testModule(userModule, {
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
    describe('users', () => {
      it('returns user', async () => {
        const user: User = {
          id: uuidv4(),
          firebaseId: 'yo',
          firstName: 'fo',
          lastName: 'sho',
          email: 'tho@no.co',
          imageUrl: 'po'
        }
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
        const userJourney: UserJourney = {
          userId: user.id,
          journeyId: publishedJourney.id,
          role: 'inviteRequested'
        }

        dbMock.journey.findMany.mockResolvedValue([userJourney])
        const { data } = await query(gql`
          query {
            userJourney {
              userId
              journeyId
              role
            }
          }
        `)
        expect(data?.journeys).toEqual([
          pick(userJourney, ['userId', 'journeyId', 'role'])
        ])
      })
    })
  })
})
