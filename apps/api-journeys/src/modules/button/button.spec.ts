import { testkit, gql } from 'graphql-modules'
import { schemaBuilder } from '@core/shared/util-graphql'
import {
  buttonModule,
  journeyModule,
  blockModule,
  actionModule,
  iconModule
} from '..'
import dbMock from '../../../tests/dbMock'
import { v4 as uuidv4 } from 'uuid'
import { Block, ThemeName, ThemeMode } from '.prisma/api-journeys-client'
import { DocumentNode, ExecutionResult } from 'graphql'

describe('ButtonModule', () => {
  let app, journeyId

  beforeEach(() => {
    app = testkit.testModule(buttonModule, {
      schemaBuilder,
      modules: [journeyModule, blockModule, actionModule, iconModule]
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
      primaryImageBlockId: null,
      slug: 'published-slug'
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

  describe('ButtonBlock', () => {
    it('returns ButtonBlock', async () => {
      const parentBlockId = uuidv4()
      const button: Block = {
        id: uuidv4(),
        journeyId,
        blockType: 'ButtonBlock',
        parentBlockId,
        parentOrder: 1,
        extraAttrs: {
          label: 'label',
          variant: 'contained',
          color: 'primary',
          size: 'large',
          fullWidth: true,
          alignSelf: 'flexEnd',
          startIcon: {
            name: 'ArrowForwardRounded',
            color: 'secondary',
            size: 'lg'
          },
          endIcon: {
            name: 'LockOpenRounded',
            color: 'action',
            size: 'xl'
          },
          action: {
            gtmEventName: 'gtmEventName',
            url: 'https://jesusfilm.org',
            target: 'target'
          }
        }
      }
      dbMock.block.findMany.mockResolvedValue([button])
      const { data } = await query(gql`
        query ($id: ID!) {
          journey(id: $id) {
            blocks {
              id
              __typename
              parentBlockId
              ... on ButtonBlock {
                label
                variant
                color
                size
                fullWidth
                alignSelf
                startIcon {
                  name
                  color
                  size
                }
                endIcon {
                  name
                  color
                  size
                }
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
              }
            }
          }
        }
      `)
      expect(data?.journey.blocks).toEqual([
        {
          id: button.id,
          __typename: 'ButtonBlock',
          parentBlockId,
          label: 'label',
          variant: 'contained',
          color: 'primary',
          size: 'large',
          fullWidth: true,
          alignSelf: 'flexEnd',
          startIcon: {
            name: 'ArrowForwardRounded',
            color: 'secondary',
            size: 'lg'
          },
          endIcon: {
            name: 'LockOpenRounded',
            color: 'action',
            size: 'xl'
          },
          action: {
            __typename: 'LinkAction',
            gtmEventName: 'gtmEventName',
            url: 'https://jesusfilm.org',
            target: 'target'
          }
        }
      ])
    })
  })
})
