import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import { userModule } from '..'
import dbMock from '../../../tests/dbMock'
import { v4 as uuidv4 } from 'uuid'
import { DocumentNode, ExecutionResult } from 'graphql'
import { firebaseClient } from '../../lib/firebaseClient'

jest.mock('../../lib/firebaseClient', () => {
  return {
    __esModule: true,
    firebaseClient: {
      auth: jest.fn().mockReturnThis(),
      getUser: jest.fn().mockResolvedValue({
        displayName: 'foo bar',
        email: 'my@example.com',
        photoURL: 'https://example.com/my-photo.jpg'
      })
    }
  }
})

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

  describe('user', () => {
    it('creates a user', async () => {
      dbMock.user.create.mockResolvedValue(user)

      const { data } = await query(
        gql`
          query {
            me {
              id
              firstName
              lastName
              email
              imageUrl
            }
          }
        `,
        {},
        {
          userId: user.id
        }
      )

      expect(firebaseClient.auth().getUser).toHaveBeenCalledWith(user.id)
      expect(data?.me).toEqual({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        imageUrl: user.imageUrl
      })
    })
    it('checks if users already exists', async () => {
      dbMock.user.findUnique.mockResolvedValue(user)

      await query(
        gql`
          query {
            me {
              id
              firstName
              lastName
              email
              imageUrl
            }
          }
        `,
        {},
        {
          userId: user.id
        }
      )

      expect(dbMock.user.findUnique).toHaveBeenCalledWith({
        where: {
          id: user.id
        }
      })
    })
  })
})
