import { testkit, gql, Application } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import { responseModule } from '.'
import dbMock from '../../../tests/dbMock'
import { v4 as uuidv4 } from 'uuid'
import { journeyModule } from '../journey'
import { blockModule } from '../block'
import { Block, Response } from '.prisma/api-journeys-client'
import { get } from 'lodash'

describe('Response', () => {
  let app: Application

  beforeEach(() => {
    app = testkit.testModule(responseModule, {
      schemaBuilder,
      modules: [journeyModule, blockModule]
    })
  })

  describe('signUpResponseCreate', () => {
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
        },
        createdAt: new Date(),
        updatedAt: new Date()
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

  describe('radioQuestionResponseCreate', () => {
    it('creates a radio question block response', async () => {
      const userId = uuidv4()
      const block1: Block = {
        id: uuidv4(),
        journeyId: uuidv4(),
        blockType: 'RadioQuestionBlock',
        parentBlockId: null,
        parentOrder: 0,
        extraAttrs: {
          label: 'label',
          description: 'description'
        }
      }
      dbMock.block.findUnique.mockResolvedValue(block1)
      const response1: Response = {
        id: uuidv4(),
        type: 'RadioQuestionResponse',
        blockId: block1.id,
        userId,
        extraAttrs: {
          radioOptionBlockId: uuidv4()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
      dbMock.response.create.mockResolvedValue(response1)
      const { data } = await testkit.execute(app, {
        document: gql`
          mutation ($input: RadioQuestionResponseCreateInput!) {
            radioQuestionResponseCreate(input: $input) {
              id
              userId
              radioOptionBlockId
              block {
                id
                label
                description
              }
            }
          }
        `,
        variableValues: {
          input: {
            id: response1.id,
            blockId: response1.blockId,
            radioOptionBlockId: get(response1.extraAttrs, 'radioOptionBlockId')
          }
        },
        contextValue: {
          db: dbMock,
          userId
        }
      })
      expect(data?.radioQuestionResponseCreate).toEqual({
        id: response1.id,
        userId,
        radioOptionBlockId: get(response1.extraAttrs, 'radioOptionBlockId'),
        block: {
          id: block1.id,
          label: 'label',
          description: 'description'
        }
      })
    })

    it('throws authentication error if no user token', async () => {
      const { errors } = await testkit.execute(app, {
        document: gql`
          mutation ($input: RadioQuestionResponseCreateInput!) {
            radioQuestionResponseCreate(input: $input) {
              id
            }
          }
        `,
        variableValues: {
          input: {
            blockId: uuidv4(),
            radioOptionBlockId: uuidv4()
          }
        },
        contextValue: {
          db: dbMock
        }
      })
      expect(errors?.[0].extensions?.code).toEqual('UNAUTHENTICATED')
    })
  })

  describe('videoResponseCreate', () => {
    it('creates a video block response', async () => {
      const userId = uuidv4()
      const block1: Block = {
        id: uuidv4(),
        journeyId: uuidv4(),
        blockType: 'VideoBlock',
        parentBlockId: null,
        parentOrder: 0,
        extraAttrs: {
          src: 'src',
          title: 'title'
        }
      }
      dbMock.block.findUnique.mockResolvedValue(block1)
      const response1: Response = {
        id: uuidv4(),
        type: 'VideoResponse',
        blockId: block1.id,
        userId,
        extraAttrs: {
          state: 'PLAYING'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
      dbMock.response.create.mockResolvedValue(response1)
      const { data } = await testkit.execute(app, {
        document: gql`
          mutation ($input: VideoResponseCreateInput!) {
            videoResponseCreate(input: $input) {
              id
              userId
              state
              block {
                id
                src
                title
              }
            }
          }
        `,
        variableValues: {
          input: {
            id: response1.id,
            blockId: response1.blockId,
            state: get(response1.extraAttrs, 'state')
          }
        },
        contextValue: {
          db: dbMock,
          userId
        }
      })
      expect(data?.videoResponseCreate).toEqual({
        id: response1.id,
        userId,
        state: 'PLAYING',
        block: {
          id: block1.id,
          src: 'src',
          title: 'title'
        }
      })
    })

    it('throws authentication error if no user token', async () => {
      const { errors } = await testkit.execute(app, {
        document: gql`
          mutation ($input: VideoResponseCreateInput!) {
            videoResponseCreate(input: $input) {
              id
            }
          }
        `,
        variableValues: {
          input: {
            blockId: uuidv4(),
            state: 'PLAYING'
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
