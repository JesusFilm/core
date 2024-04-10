import { Injectable } from '@nestjs/common'
import algoliasearch from 'algoliasearch'

import { Translation } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

@Injectable()
export class AlgoliaService {
  constructor(private readonly prisma: PrismaService) {}
  async syncVideosToAlgolia(): Promise<void> {
    const apiKey = process.env.ALGOLIA_API_KEY ?? ''
    const appId = process.env.ALGOLIA_APPLICATION_ID ?? ''

    if (apiKey === '' || appId === '')
      throw new Error('Algolia API key or app ID not set')

    const client = algoliasearch(appId, apiKey)
    console.log('syncing videos to algolia...')

    let offset = 0
    const totalRecords = await this.prisma.videoVariant.count()

    while (true) {
      const videoVariants = await this.prisma.videoVariant.findMany({
        take: 1000,
        skip: offset,
        include: {
          video: { include: { title: true } },
          subtitle: true
        }
      })

      if (videoVariants.length === 0) {
        break
      }

      const transformedVideos = videoVariants.map((videoVariant) => {
        return {
          objectID: videoVariant.id,
          videoId: videoVariant.videoId,
          titles: videoVariant.video?.title.map((title) => title.value),
          description: (
            videoVariant.video?.description as unknown as Translation[]
          ).map((description) => description?.value),
          duration: videoVariant.duration,
          languageId: videoVariant.languageId,
          subtitles: videoVariant.subtitle.map(
            (subtitle) => subtitle.languageId
          ),
          slug: videoVariant.slug,
          label: videoVariant.video?.label,
          image: videoVariant.video?.image,
          imageAlt: (videoVariant.video?.imageAlt as unknown as Translation)[0]
            .value,
          childrenCount: videoVariant.video?.childIds.length
        }
      })

      const progress = Math.round(((offset + 1) / totalRecords) * 100)
      console.log('syncVideosWithAlgolia page:', offset)
      console.log(`algolia videos synced: ${progress}%`)

      const index = client.initIndex('video-variants')
      await index.saveObjects(transformedVideos).wait()

      offset += 1000
    }

    console.log('synced videos to algolia')
  }
}
