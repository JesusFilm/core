import { Taxonomy, TaxonomyName } from '@core/prisma/media/client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

describe('Taxonomy', () => {
  const client = getClient()

  describe('taxonomies', () => {
    const TAXONOMIES_QUERY = graphql(`
      query taxonomies($category: String, $languageCodes: [String!]) {
        taxonomies(category: $category) {
          id
          category
          term
          name(languageCodes: $languageCodes) {
            id
            term
            label
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
          name: []
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
              taxonomy: {
                category: undefined
              }
            }
          }
        },
        where: {
          category: undefined,
          name: {
            some: {
              languageCode: {
                in: undefined
              }
            }
          }
        }
      })

      expect(data).toHaveProperty('data.taxonomies', [
        {
          id: '1',
          category: 'book',
          term: 'genesis',
          name: []
        }
      ])
    })

    it('should query taxonomies with filters', async () => {
      prismaMock.taxonomy.findMany.mockResolvedValue([
        {
          id: '2',
          category: 'chapter',
          term: 'exodus',
          name: []
        }
      ] as Array<Taxonomy & { name: TaxonomyName[] }>)

      const data = await client({
        document: TAXONOMIES_QUERY,
        variables: {
          category: 'chapter',
          languageCodes: ['en']
        }
      })

      expect(prismaMock.taxonomy.findMany).toHaveBeenCalledWith({
        include: {
          name: {
            where: {
              languageCode: {
                in: ['en']
              },
              taxonomy: {
                category: undefined
              }
            }
          }
        },
        where: {
          category: 'chapter',
          name: {
            some: {
              languageCode: {
                in: undefined
              }
            }
          }
        }
      })

      expect(data).toHaveProperty('data.taxonomies', [
        {
          id: '2',
          category: 'chapter',
          term: 'exodus',
          name: []
        }
      ])
    })
  })
})
