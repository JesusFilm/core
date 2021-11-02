import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import { imageModule, journeyModule, blockModule } from '..'
import dbMock from '../../../tests/dbMock'
import { v4 as uuidv4 } from 'uuid'
import {
  Journey,
  Block,
  ThemeName,
  ThemeMode
} from '.prisma/api-journeys-client'
import { DocumentNode, ExecutionResult } from 'graphql'
import { ImageBlockCreateInput } from '../../__generated__/types'
import { readFileSync } from 'fs'
import path from 'path'

jest.mock('canvas', () => {
  const originalModule = jest.requireActual('canvas')
  return {
    __esModule: true,
    ...originalModule,
    loadImage: jest.fn().mockImplementation((src) => {
      switch (src) {
        case 'https://blurha.sh/assets/images/img2.jpg':
          return originalModule.loadImage(
            readFileSync(path.join(__dirname, './fixtures/blurhash-img2.jpg'))
          )
        case 'http://example.com':
          throw Error('Unsupported image type')
        default:
          return originalModule.loadImage(src)
      }
    })
  }
})

describe('ImageModule', () => {
  let app, journeyId

  beforeEach(() => {
    app = testkit.testModule(imageModule, {
      schemaBuilder,
      modules: [journeyModule, blockModule]
    })
    journeyId = uuidv4()
    dbMock.journey.findUnique.mockResolvedValue({
      id: journeyId,
      title: 'published',
      published: true,
      locale: 'en-US',
      themeMode: ThemeMode.light,
      themeName: ThemeName.base,
      description: null,
      primaryImageBlockId: null
    })
  })

  async function query(
    document: DocumentNode,
    variableValues?: { [key: string]: unknown },
    contextValue?: { [key: string]: unknown }
  ): Promise<ExecutionResult> {
    return await testkit.execute(app, {
      document,
      variableValues:
        variableValues != null
          ? variableValues
          : {
              id: journeyId
            },
      contextValue: {
        ...contextValue,
        db: dbMock
      }
    })
  }

  describe('ImageBlock', () => {
    it('returns ImageBlock', async () => {
      const parentBlockId = uuidv4()
      const image: Block = {
        id: uuidv4(),
        journeyId,
        blockType: 'ImageBlock',
        parentBlockId,
        parentOrder: 2,
        extraAttrs: {
          src: 'https://source.unsplash.com/random/1920x1080',
          alt: 'random image from unsplash',
          width: 1920,
          height: 1080
        }
      }
      dbMock.block.findMany.mockResolvedValue([image])
      const { data } = await query(gql`
        query ($id: ID!) {
          journey(id: $id) {
            blocks {
              id
              __typename
              parentBlockId
              ... on ImageBlock {
                src
                alt
                width
                height
              }
            }
          }
        }
      `)
      expect(data?.journey.blocks).toEqual([
        {
          id: image.id,
          __typename: 'ImageBlock',
          parentBlockId,
          src: 'https://source.unsplash.com/random/1920x1080',
          alt: 'random image from unsplash',
          width: 1920,
          height: 1080
        }
      ])
    })

    it('returns src from a journey with primaryImageBlock', async () => {
      const journey: Journey = {
        id: 'journeyId',
        title: 'published',
        published: true,
        locale: 'hi-IN',
        themeName: ThemeName.base,
        themeMode: ThemeMode.light,
        description: null,
        primaryImageBlockId: 'primaryImageBlockId'
      }

      const primaryImage: Block = {
        id: 'primaryImageBlockId',
        journeyId,
        blockType: 'ImageBlock',
        parentBlockId: uuidv4(),
        parentOrder: 2,
        extraAttrs: {
          src: 'https://source.unsplash.com/random/1920x1080',
          alt: 'random image from unsplash',
          width: 1920,
          height: 1080
        }
      }

      dbMock.journey.findUnique.mockResolvedValue(journey)
      dbMock.block.findUnique.mockResolvedValue(primaryImage)

      const { data } = await testkit.execute(app, {
        document: gql`
          query ($id: ID!) {
            journey(id: $id) {
              primaryImageBlock {
                src
              }
            }
          }
        `,
        variableValues: {
          id: journey.id
        },
        contextValue: {
          db: dbMock,
          userId: 'userId'
        }
      })
      expect(data?.journey.primaryImageBlock.src).toEqual(
        'https://source.unsplash.com/random/1920x1080'
      )
    })
    it('returns null when primaryImageBlock does not have src', async () => {
      const journey: Journey = {
        id: 'journeyId',
        title: 'published',
        published: true,
        locale: 'hi-IN',
        themeName: ThemeName.base,
        themeMode: ThemeMode.light,
        description: null,
        primaryImageBlockId: 'primaryImageBlockId'
      }

      const primaryImage: Block = {
        id: 'primaryImageBlockId',
        journeyId,
        blockType: 'ImageBlock',
        parentBlockId: uuidv4(),
        parentOrder: 2,
        extraAttrs: {
          alt: 'random image from unsplash',
          width: 1920,
          height: 1080
        }
      }

      dbMock.journey.findUnique.mockResolvedValue(journey)
      dbMock.block.findUnique.mockResolvedValue(primaryImage)

      const { data } = await testkit.execute(app, {
        document: gql`
          query ($id: ID!) {
            journey(id: $id) {
              primaryImageBlock {
                src
              }
            }
          }
        `,
        variableValues: {
          id: journey.id
        },
        contextValue: {
          db: dbMock,
          userId: 'userId'
        }
      })
      expect(data?.journey.primaryImageBlock).toBeNull()
    })
  })

  describe('imageBlockCreate', () => {
    it('creates an ImageBlock', async () => {
      const id = uuidv4()
      const parentBlockId = uuidv4()
      const input: ImageBlockCreateInput = {
        id,
        parentBlockId,
        journeyId,
        src: 'https://blurha.sh/assets/images/img2.jpg',
        alt: 'grid image'
      }
      const block: Block = {
        id,
        parentBlockId,
        journeyId,
        blockType: 'ImageBlock',
        parentOrder: 0,
        extraAttrs: {
          src: input.src,
          alt: input.alt,
          width: 301,
          height: 193,
          blurhash: 'UHFO~6Yk^6#M@-5b,1J5@[or[k6o};Fxi^OZ'
        }
      }
      dbMock.block.create.mockResolvedValue(block)
      const { data } = await query(
        gql`
          mutation ($input: ImageBlockCreateInput!) {
            imageBlockCreate(input: $input) {
              id
              parentBlockId
              src
              width
              height
              alt
              blurhash
            }
          }
        `,
        { input },
        { userId: uuidv4() }
      )
      expect(data?.imageBlockCreate).toEqual({
        alt: 'grid image',
        blurhash: 'UHFO~6Yk^6#M@-5b,1J5@[or[k6o};Fxi^OZ',
        height: 193,
        id: input.id,
        parentBlockId: input.parentBlockId,
        src: 'https://blurha.sh/assets/images/img2.jpg',
        width: 301
      })
    })

    it('throws authentication error if no user token', async () => {
      const input: ImageBlockCreateInput = {
        id: uuidv4(),
        parentBlockId: uuidv4(),
        journeyId,
        src: 'https://blurha.sh/assets/images/img2.jpg',
        alt: 'grid image'
      }
      const { errors } = await query(
        gql`
          mutation ($input: ImageBlockCreateInput!) {
            imageBlockCreate(input: $input) {
              id
              parentBlockId
              src
              width
              height
              alt
              blurhash
            }
          }
        `,
        { input }
      )
      expect(errors?.[0].extensions?.code).toEqual('UNAUTHENTICATED')
    })

    it('throws authentication error if no user token', async () => {
      const input: ImageBlockCreateInput = {
        id: uuidv4(),
        parentBlockId: uuidv4(),
        journeyId,
        src: 'http://example.com',
        alt: 'grid image'
      }
      const { errors } = await query(
        gql`
          mutation ($input: ImageBlockCreateInput!) {
            imageBlockCreate(input: $input) {
              id
              parentBlockId
              src
              width
              height
              alt
              blurhash
            }
          }
        `,
        { input },
        { userId: uuidv4() }
      )
      expect(errors?.[0]).toEqual({
        extensions: { argumentName: 'src', code: 'BAD_USER_INPUT' },
        locations: [{ column: 13, line: 3 }],
        message: 'Unsupported image type',
        path: ['imageBlockCreate']
      })
    })
  })
})
