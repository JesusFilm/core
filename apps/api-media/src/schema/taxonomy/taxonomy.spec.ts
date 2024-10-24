import { Taxonomy, TaxonomyName } from '.prisma/api-media-client'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

describe('Taxonomy', () => {
  const client = getClient()

  describe('taxonomies', () => {
    const TAXONOMIES_QUERY = graphql(`
      query Taxonomies($offset: Int, $limit: Int, $where: TaxonomiesFilter) {
        taxonomies(offset: $offset, limit: $limit, where: $where) {
          id
          category
          term
          name(languageId: "529") {
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
              languageId: '529'
            }
          }
        },
        where: {},
        skip: undefined,
        take: undefined
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
          offset: 1,
          limit: 10,
          where: {
            ids: ['2'],
            category: 'chapter'
          }
        }
      })

      expect(prismaMock.taxonomy.findMany).toHaveBeenCalledWith({
        include: {
          name: {
            where: {
              languageId: '529'
            }
          }
        },
        where: {
          id: { in: ['2'] },
          category: 'chapter'
        },
        skip: 1,
        take: 10
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

  describe('taxonomy', () => {
    const TAXONOMY_QUERY = graphql(`
      query Taxonomy($id: ID!) {
        taxonomy(id: $id) {
          id
          category
          term
          name(languageId: "529") {
            id
            term
            label
            languageId
            languageCode
          }
        }
      }
    `)

    it('should query a single taxonomy', async () => {
      const taxonomy: Taxonomy & { name: TaxonomyName[] } = {
        id: '3',
        category: 'verse',
        term: 'john_3_16',
        name: [
          {
            id: '3',
            term: 'john_3_16',
            label: 'John 3:16',
            languageId: '529',
            languageCode: 'en'
          }
        ]
      }

      prismaMock.taxonomy.findUnique.mockResolvedValue(taxonomy)

      const data = await client({
        document: TAXONOMY_QUERY,
        variables: { id: '3' }
      })

      expect(prismaMock.taxonomy.findUnique).toHaveBeenCalledWith({
        include: {
          name: {
            where: {
              languageId: '529'
            }
          }
        },
        where: { id: '3' }
      })

      expect(data).toHaveProperty('data.taxonomy', {
        id: '3',
        category: 'verse',
        term: 'john_3_16',
        name: [
          {
            id: '3',
            term: 'john_3_16',
            label: 'John 3:16',
            languageId: '529',
            languageCode: 'en'
          }
        ]
      })
    })
  })
})
