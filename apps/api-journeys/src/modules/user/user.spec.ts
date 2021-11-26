import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import { userModule } from '..'
import dbMock from '../../../tests/dbMock'
import { v4 as uuidv4 } from 'uuid'
import { DocumentNode, ExecutionResult } from 'graphql'
import { pick } from 'lodash'

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

  describe('Query', () => {
    describe('get user by id', () => {
      it('returns user', async () => {
        dbMock.user.findUnique.mockResolvedValue(user)
        const { data } = await query(
          gql`
            query ($id: ID!) {
              user(id: $id) {
                id
                firstName
                lastName
                email
                imageUrl
              }
            }
          `,
          {
            id: user.id
          }
        )
        expect(data?.user).toEqual(
          pick(user, [
            'id',
            'email',
            'firstName',
            'lastName',
            'imageUrl'
          ])
        )
      })
    })


    describe('list of users', () => {
      it('returns all users', async () => {
        dbMock.user.findMany.mockResolvedValue([user])
        const { data } = await query(gql`
          query {
            users {
              id
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
            'email',
            'firstName',
            'lastName',
            'imageUrl'
          ])
        ])
      })
    })
  })

  describe('Mutation', () => {
    it('creates a user', async () => {
      dbMock.user.create.mockResolvedValue(user)
      const { data } = await query(
        gql`
          mutation ($input: UserCreateInput!) {
            userCreate(input: $input) {
              id
              firstName
              lastName
              email
              imageUrl
            }
          }
        `,
        {
          input: {
            id: user.id,
            firstName: 'fo',
            lastName: 'sho',
            email: 'tho@no.co',
            imageUrl: 'po'
          }
        },
        {
          userId: 'userId'
        }
      )
      expect(data?.userCreate).toEqual({
        id: user.id,
        firstName: 'fo',
        lastName: 'sho',
        email: 'tho@no.co',
        imageUrl: 'po'
      })
    })
  })
})
