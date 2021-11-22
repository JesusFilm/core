import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import { typographyModule, journeyModule, blockModule } from '..'
import dbMock from '../../../tests/dbMock'
import { v4 as uuidv4 } from 'uuid'
import { Block, ThemeName, ThemeMode } from '.prisma/api-journeys-client'
import { DocumentNode, ExecutionResult } from 'graphql'

describe('TypographyModule', () => {
  let app, journeyId
  const publishedAt = new Date()
  const createdAt = new Date()

  beforeEach(() => {
    app = testkit.testModule(typographyModule, {
      schemaBuilder,
      modules: [journeyModule, blockModule]
    })
    journeyId = uuidv4()
    dbMock.journey.findUnique.mockResolvedValue({
      id: journeyId,
      title: 'published',
      locale: 'en-US',
      themeMode: ThemeMode.light,
      themeName: ThemeName.base,
      description: null,
      primaryImageBlockId: null,
      slug: 'published-slug',
      publishedAt,
      createdAt
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

  describe('TypographyBlock', () => {
    it('returns TypographyBlock', async () => {
      const parentBlockId = uuidv4()
      const typography: Block = {
        id: uuidv4(),
        journeyId,
        blockType: 'TypographyBlock',
        parentBlockId,
        parentOrder: 7,
        extraAttrs: {
          content: 'text',
          variant: 'h2',
          color: 'primary',
          align: 'left'
        }
      }
      dbMock.block.findMany.mockResolvedValue([typography])
      const { data } = await query(gql`
        query ($id: ID!) {
          journey(id: $id) {
            blocks {
              id
              __typename
              parentBlockId
              ... on TypographyBlock {
                content
                variant
                color
                align
              }
            }
          }
        }
      `)
      expect(data?.journey.blocks).toEqual([
        {
          id: typography.id,
          __typename: 'TypographyBlock',
          parentBlockId,
          content: 'text',
          variant: 'h2',
          color: 'primary',
          align: 'left'
        }
      ])
    })
  })
})
