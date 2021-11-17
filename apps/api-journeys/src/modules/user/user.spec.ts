import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import { userModule } from '..'
import dbMock from '../../../tests/dbMock'
import { v4 as uuidv4 } from 'uuid'
import { User } from '.prisma/api-journeys-client'
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

        dbMock.user.findMany.mockResolvedValue([user])
        const { data } = await query(gql`
          query {
            user {
              id
              firebaseId
              firstName
              lastName
              email
              imageUrl
            }
          }
        `)
        expect(data?.users).toEqual([
          pick(user, [
            'id',
            'title',
            'published',
            'locale',
            'themeName',
            'themeMode',
            'slug'
          ])
        ])
      })
    })
  })
})
