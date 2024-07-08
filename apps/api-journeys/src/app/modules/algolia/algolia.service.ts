import { Injectable } from '@nestjs/common'
import algoliasearch from 'algoliasearch'

import { PrismaService } from '../../lib/prisma.service'

@Injectable()
export class AlgoliaService {
  constructor(private readonly prisma: PrismaService) {}

  async syncJourneysToAlgolia(): Promise<void> {
    const apiKey = process.env.ALGOLIA_API_KEY ?? ''
    const appId = process.env.ALGOLIA_APPLICATION_ID ?? ''
    const nodeEnv = process.env.NODE_ENV ?? ''

    if (apiKey === '' || appId === '' || nodeEnv !== '')
      throw new Error('algolia environment variables not set')

    const client = algoliasearch(appId, apiKey)
    console.log('syncing journeys to algolia...')

    let offset = 0

    while (true) {
      const journeys = await this.prisma.journey.findMany({
        take: 50,
        skip: offset,
        include: {
          primaryImageBlock: true
        },
        where: {
          template: true
        }
      })

      if (journeys.length === 0) break

      const transformedJourneys = journeys.map((journey) => {
        return {
          objectID: journey.id,
          title: journey.title,
          date: journey.createdAt,
          description: journey.description,
          image: {
            src: journey.primaryImageBlock?.src,
            alt: journey.primaryImageBlock?.alt
          },
          languageId: journey.languageId,
          featuredAt: journey.featuredAt
        }
      })

      console.log('transformedJourneys')

      // const index = client.initIndex(`api-journeys-journeys-${nodeEnv}`)
      // await index.saveObjects(transformedJourneys).wait()

      offset += 50
    }

    console.log('synced journeys to algolia')
  }
}
