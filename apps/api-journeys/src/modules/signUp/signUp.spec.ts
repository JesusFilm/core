import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import {
  signUpModule,
  actionModule,
  journeyModule,
  blockModule,
  responseModule,
  iconModule
} from '..'
import dbMock from '../../../tests/dbMock'
import { v4 as uuidv4 } from 'uuid'
import {
  Block,
  ThemeName,
  ThemeMode,
  Response
} from '.prisma/api-journeys-client'
import { DocumentNode, ExecutionResult } from 'graphql'

describe('SignUpModule', () => {
  let app, journeyId

  beforeEach(() => {
    app = testkit.testModule(signUpModule, {
      schemaBuilder,
      modules: [
        journeyModule,
        blockModule,
        responseModule,
        actionModule,
        iconModule
      ]
    })
    journeyId = uuidv4()
    dbMock.journey.findUnique.mockResolvedValue({
      id: journeyId,
      title: 'published',
      published: true,
      locale: 'en-US',
      themeMode: ThemeMode.light,
      themeName: ThemeName.base
    })
  })

  async function query(document: DocumentNode): Promise<ExecutionResult> {
    return await testkit.execute(app, {
      document,
      variableValues: {
        id: journeyId
      },
      contextValue: {
        db: dbMock
      }
    })
  }

  describe('SignUpBlock', () => {
    it('returns SignUpBlock', async () => {
      const parentBlockId = uuidv4()
      const signUp: Block = {
        id: uuidv4(),
        journeyId,
        blockType: 'SignUpBlock',
        parentBlockId,
        parentOrder: 2,
        extraAttrs: {
          action: {
            gtmEventName: 'gtmEventName',
            journeyId
          },
          submitIcon: {
            name: 'LockOpen',
            color: 'secondary',
            size: 'lg'
          },
          submitLabel: 'Unlock Now!'
        }
      }
      dbMock.block.findMany.mockResolvedValue([signUp])
      const { data } = await query(gql`
        query ($id: ID!) {
          journey(id: $id) {
            blocks {
              id
              __typename
              parentBlockId
              action {
                __typename
                gtmEventName
                ... on NavigateToBlockAction {
                  blockId
                }
                ... on NavigateToJourneyAction {
                  journeyId
                }
                ... on LinkAction {
                  url
                  target
                }
              }
              submitIcon {
                name
                color
                size
              }
              submitLabel
            }
          }
        }
      `)
      expect(data?.journey.blocks).toEqual([
        {
          id: signUp.id,
          __typename: 'SignUpBlock',
          parentBlockId,
          action: {
            __typename: 'NavigateToJourneyAction',
            gtmEventName: 'gtmEventName',
            journeyId
          },
          submitIcon: {
            name: 'LockOpen',
            color: 'secondary',
            size: 'lg'
          },
          submitLabel: 'Unlock Now!'
        }
      ])
    })
  })

  describe('SignUpResponse', () => {
    it('creates a signUp block response', async () => {
      const userId = uuidv4()
      const block1: Block = {
        id: uuidv4(),
        journeyId: uuidv4(),
        blockType: 'SignUpBlock',
        parentBlockId: null,
        parentOrder: 0,
        extraAttrs: {}
      }
      dbMock.block.findUnique.mockResolvedValue(block1)
      const response1: Response = {
        id: uuidv4(),
        type: 'SignUpResponse',
        blockId: block1.id,
        userId,
        extraAttrs: {
          name: 'Robert Smith',
          email: 'robert.smith@jesusfilm.org'
        }
      }
      dbMock.response.create.mockResolvedValue(response1)
      const { data } = await testkit.execute(app, {
        document: gql`
          mutation ($input: SignUpResponseCreateInput!) {
            signUpResponseCreate(input: $input) {
              id
              userId
              name
              email
              block {
                id
              }
            }
          }
        `,
        variableValues: {
          input: {
            id: response1.id,
            blockId: response1.blockId,
            name: 'Robert Smith',
            email: 'robert.smith@jesusfilm.org'
          }
        },
        contextValue: {
          db: dbMock,
          userId
        }
      })
      expect(data?.signUpResponseCreate).toEqual({
        id: response1.id,
        userId,
        name: 'Robert Smith',
        email: 'robert.smith@jesusfilm.org',
        block: {
          id: block1.id
        }
      })
    })

    it('throws authentication error if no user token', async () => {
      const { errors } = await testkit.execute(app, {
        document: gql`
          mutation ($input: SignUpResponseCreateInput!) {
            signUpResponseCreate(input: $input) {
              id
            }
          }
        `,
        variableValues: {
          input: {
            blockId: uuidv4(),
            name: 'Robert Smith',
            email: 'robert.smith@jesusfilm.org'
          }
        },
        contextValue: {
          db: dbMock
        }
      })
      expect(errors?.[0].extensions?.code).toEqual('UNAUTHENTICATED')
    })
  })
})
