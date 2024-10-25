import { Taxonomy, TaxonomyName } from '.prisma/api-media-client'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

describe('Taxonomy', () => {
  const client = getClient()

  describe('taxonomies', () => {
    const TAXONOMIES_QUERY = graphql(`
      query Taxonomies($category: String, $languageCodes: [String!]) {
        taxonomies(category: $category) {
          id
          category
          term
          name(languageCodes: $languageCodes) {
            id
            term
            label
            languageId
            languageCode
          }
        }
      }
    `)

    it('should query taxonomies', async () => {
      prismaMock.taxonomy.findMany.mockResolvedValue([
        {
          id: '1',
          category: 'book',
          term: 'genesis',
          name: [
            {
              id: '1',
              term: 'genesis',
              label: 'Genesis',
              languageId: '529',
              languageCode: 'en'
            }
          ]
        }
      ] as Array<Taxonomy & { name: TaxonomyName[] }>)

      const data = await client({
        document: TAXONOMIES_QUERY
      })

      expect(prismaMock.taxonomy.findMany).toHaveBeenCalledWith({
        include: {
          name: {
            where: {
              languageCode: {
                in: undefined
              },
              languageId: undefined,
              taxonomy: {
                category: undefined
              }
            }
          }
        },
        where: {
          category: undefined
        }
      })

      expect(data).toHaveProperty('data.taxonomies', [
        {
          id: '1',
          category: 'book',
          term: 'genesis',
          name: [
            {
              id: '1',
              term: 'genesis',
              label: 'Genesis',
              languageId: '529',
              languageCode: 'en'
            }
          ]
        }
      ])
    })

    it('should query taxonomies with filters', async () => {
      prismaMock.taxonomy.findMany.mockResolvedValue([
        {
          id: '2',
          category: 'chapter',
          term: 'exodus',
          name: [
            {
              id: '2',
              term: 'exodus',
              label: 'Exodus',
              languageId: '529',
              languageCode: 'en'
            }
          ]
        }
      ] as Array<Taxonomy & { name: TaxonomyName[] }>)

      const data = await client({
        document: TAXONOMIES_QUERY,
        variables: {
          category: 'chapter'
        }
      })

      expect(prismaMock.taxonomy.findMany).toHaveBeenCalledWith({
        include: {
          name: {
            where: {
              languageCode: {
                in: undefined
              },
              languageId: undefined,
              taxonomy: {
                category: undefined
              }
            }
          }
        },
        where: {
          category: 'chapter'
        }
      })

      expect(data).toHaveProperty('data.taxonomies', [
        {
          id: '2',
          category: 'chapter',
          term: 'exodus',
          name: [
            {
              id: '2',
              term: 'exodus',
              label: 'Exodus',
              languageId: '529',
              languageCode: 'en'
            }
          ]
        }
      ])
    })
  })
})
