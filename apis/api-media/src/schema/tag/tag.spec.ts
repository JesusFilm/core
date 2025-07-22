import { Tag, TagName } from '.prisma/api-media-client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

describe('Tag', () => {
  const client = getClient()

  describe('tags', () => {
    const TAGS_QUERY = graphql(`
      query Tags($languageId: ID, $primary: Boolean) {
        tags {
          id
          parentId
          service
          name(languageId: $languageId, primary: $primary) {
            value
            primary
            language {
              id
            }
          }
        }
      }
    `)

    it('should query tags', async () => {
      prismaMock.tag.findMany.mockResolvedValue([
        {
          id: '1',
          tagName: [
            {
              value: 'Genesis',
              primary: true,
              languageId: '529'
            }
          ],
          parentId: null,
          service: null
        }
      ] as Array<Tag & { tagName: TagName[] }>)
      const data = await client({
        document: TAGS_QUERY
      })
      expect(prismaMock.tag.findMany).toHaveBeenCalledWith({
        include: {
          tagName: {
            orderBy: {
              primary: 'desc'
            },
            where: {
              OR: [{ languageId: '529' }]
            }
          }
        },
        orderBy: { name: 'asc' }
      })
      expect(data).toHaveProperty('data.tags', [
        {
          id: '1',
          name: [
            {
              value: 'Genesis',
              primary: true,
              language: { id: '529' }
            }
          ],
          parentId: null,
          service: null
        }
      ])
    })

    it('should query tags with languageId', async () => {
      prismaMock.tag.findMany.mockResolvedValue([
        {
          id: '1',
          tagName: [
            {
              value: 'Genesis',
              primary: true,
              languageId: '529'
            },
            {
              value: 'Genèse',
              primary: false,
              languageId: '987'
            }
          ],
          parentId: 'parentTagId',
          service: 'apiJourneys'
        }
      ] as Array<Tag & { tagName: TagName[] }>)
      const data = await client({
        document: TAGS_QUERY,
        variables: { languageId: '987', primary: true }
      })
      expect(prismaMock.tag.findMany).toHaveBeenCalledWith({
        include: {
          tagName: {
            orderBy: {
              primary: 'desc'
            },
            where: {
              OR: [
                {
                  primary: true
                },
                {
                  languageId: '987'
                }
              ]
            }
          }
        },
        orderBy: { name: 'asc' }
      })
      expect(data).toHaveProperty('data.tags', [
        {
          id: '1',
          name: [
            {
              value: 'Genesis',
              primary: true,
              language: { id: '529' }
            },
            {
              value: 'Genèse',
              primary: false,
              language: { id: '987' }
            }
          ],
          parentId: 'parentTagId',
          service: 'apiJourneys'
        }
      ])
    })
  })
})
