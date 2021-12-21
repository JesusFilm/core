import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import { userModule } from '..'
import dbMock from '../../../tests/dbMock'
import { v4 as uuidv4 } from 'uuid'
import { DocumentNode, ExecutionResult } from 'graphql'

describe('UserModule', () => {
  let app, user

  beforeEach(() => {
    app = testkit.testModule(userModule, {
      schemaBuilder
    })

    user = {
      id: uuidv4(),
      firstName: 'fo',
      lastName: 'sho',
      email: 'tho@no.co',
      imageUrl: 'po'
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
    it('creates a user', async () => {
      dbMock.user.create.mockResolvedValue(user)

      await query(
        gql`
          mutation ($input: UserCreateInput!) {
            userCreate(input: $input) {
              id
            }
          }
        `,
        {
          id: user.id
        },
        {
          userId: 'userId'
        }
      )
      expect(dbMock.user.create).toBeCalledWith({
        data: {
          id: 'userId',
          firstName: 'fo',
          lastName: 'sho',
          email: 'tho@no.co',
          imageUrl: 'po'
        }
      })
    })
  })
})
