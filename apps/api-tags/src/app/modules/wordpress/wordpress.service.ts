import { Injectable } from '@nestjs/common'
import axios from 'axios'
import { PrismaService } from '../../lib/prisma.service'

const WP_API_URL = 'https://develop.jesusfilm.org/wp-json/wp/v2'

@Injectable()
export class WordPressService {
  constructor(private readonly prisma: PrismaService) {}

  async getWordPressCoreTags() {
    try {
      const response = await axios.get(`${WP_API_URL}/core-tags?per_page=100`, {
        auth: {
          username: process.env.WORDPRESS_USER ?? '',
          password: process.env.WORDPRESS_APPLICATION_PASSWORD ?? ''
        }
      })
      return response.data
    } catch (error) {
      console.log('Error getting core tags from wordpress', error)
      throw error
    }
  }

  async createWordPressCoreTag(name: string) {
    try {
      const response = await axios.post(
        `${WP_API_URL}/core-tags`,
        {
          name
        },
        {
          auth: {
            username: process.env.WORDPRESS_USER ?? '',
            password: process.env.WORDPRESS_APPLICATION_PASSWORD ?? ''
          }
        }
      )
      console.log('Core tag created in wordpress', response.data)
    } catch (error) {
      console.log('Error creating core tag in wordpress', error)
      throw error
    }
  }

  async syncTagsToWordPress(): Promise<void> {
    const applicationPassword = process.env.WORDPRESS_APPLICATION_PASSWORD ?? ''
    const user = process.env.WORDPRESS_USER ?? ''

    if (applicationPassword === '' || user === '')
      throw new Error('Wordpress environment variables not set')

    try {
      const coreTags = await this.prisma.tag.findMany({})
      const wordpressTags = await this.getWordPressCoreTags()

      const filteredTags = coreTags.filter(
        (coreTag) =>
          !wordpressTags.some(
            (wordpressTag) => wordpressTag.name === coreTag.name
          )
      )

      await Promise.all(
        filteredTags.map(
          async (tag) => await this.createWordPressCoreTag(tag.name)
        )
      )

      console.log('Tag synchronization complete')
    } catch (error) {
      console.log('Error syncing tags to wordpress', error)
    }
  }
}
