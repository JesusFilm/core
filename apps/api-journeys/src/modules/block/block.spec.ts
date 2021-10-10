import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import { blockModule } from '.'
import { actionModule, journeyModule } from '..'
import dbMock from '../../../tests/dbMock'

import { v4 as uuidv4 } from 'uuid'
import { Block, ThemeName, ThemeMode } from '.prisma/api-journeys-client'
import { DocumentNode, ExecutionResult } from 'graphql'

describe('BlockModule', () => {
  let app, journeyId

  beforeEach(() => {
    app = testkit.testModule(blockModule, {
      schemaBuilder,
      modules: [journeyModule, actionModule]
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

  it('returns CardBlock', async () => {
    const parentBlockId = uuidv4()
    const coverBlockId = uuidv4()
    const card: Block = {
      id: uuidv4(),
      journeyId,
      blockType: 'CardBlock',
      parentBlockId,
      parentOrder: 0,
      extraAttrs: {
        backgroundColor: '#FFF',
        coverBlockId,
        themeMode: ThemeMode.light,
        themeName: ThemeName.base
      }
    }
    dbMock.block.findMany.mockResolvedValue([card])
    const { data } = await query(gql`
      query ($id: ID!) {
        journey(id: $id) {
          blocks {
            id
            __typename
            parentBlockId
            ... on CardBlock {
              backgroundColor
              coverBlockId
              themeMode
              themeName
            }
          }
        }
      }
    `)
    expect(data?.journey.blocks).toEqual([
      {
        id: card.id,
        __typename: 'CardBlock',
        parentBlockId,
        backgroundColor: '#FFF',
        coverBlockId,
        themeMode: ThemeMode.light,
        themeName: ThemeName.base
      }
    ])
  })

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

  it('returns StepBlock', async () => {
    const parentBlockId = uuidv4()
    const nextBlockId = uuidv4()
    const step: Block = {
      id: uuidv4(),
      journeyId,
      blockType: 'StepBlock',
      parentBlockId,
      parentOrder: 0,
      extraAttrs: {
        locked: true,
        nextBlockId
      }
    }
    dbMock.block.findMany.mockResolvedValue([step])
    const { data } = await query(gql`
      query ($id: ID!) {
        journey(id: $id) {
          blocks {
            id
            __typename
            parentBlockId
            ... on StepBlock {
              locked
              nextBlockId
            }
          }
        }
      }
    `)
    expect(data?.journey.blocks).toEqual([
      {
        id: step.id,
        __typename: 'StepBlock',
        parentBlockId,
        locked: true,
        nextBlockId
      }
    ])
  })
})
