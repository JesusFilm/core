import { Injectable } from '@nestjs/common'

import axios from 'axios'
import { PrismaService } from '../../lib/prisma.service'

const WP_API_URL = 'https://develop.jesusfilm.org/wp-json/wp/v2'

@Injectable()
export class WordPressService {
  constructor(private readonly prisma: PrismaService) {}

  async getWordPressCoreTags() {
    try {
      const response = await axios.get(`${WP_API_URL}/core-tags`, {
        auth: {
          username: process.env.WORDPRESS_USER ?? '',
          password: process.env.WORDPRESS_APPLICATION_PASSWORD ?? ''
        }
      })
      return response.data
    } catch (error) {
      console.log('Error getting core tags from wordpress', error)
    }
  }

  async createWordPressCoreTag(name: string) {
    try {
      const response = await axios.post(
        `${WP_API_URL}/core-tags`,
        { name },
        {
          auth: {
            username: process.env.WORDPRESS_USER ?? '',
            password: process.env.WORDPRESS_APPLICATION_PASSWORD ?? ''
          }
        }
      )
      return response.data
    } catch (error) {
      console.log('Error creating core tag in wordpress', error.response.data)
    }
  }

  async updateWordPressCoreTag(id: string, name: string): Promise<void> {
    try {
      await axios.put(
        `${WP_API_URL}/core-tags/${id}`,
        { name },
        {
          auth: {
            username: process.env.WORDPRESS_USER ?? '',
            password: process.env.WORDPRESS_APPLICATION_PASSWORD ?? ''
          }
        }
      )
    } catch (error) {
      console.log('Error updating core tag in wordpress', error)
    }
  }

  async syncTagsToWordPress(): Promise<void> {
    try {
      const coreTags = await this.prisma.tag.findMany({})
      const wordpressTags = await this.getWordPressCoreTags()

      for (const coreTag of coreTags) {
        const existingTag = wordpressTags.find(
          (tag) => tag.name === coreTag.name
        )

        if (existingTag != null) {
          await this.updateWordPressCoreTag(existingTag.id, coreTag.name)
        } else {
          await this.createWordPressCoreTag(coreTag.name)
        }
      }
      console.log('wordPressTags', wordpressTags)
    } catch (error) {
      console.log('Error syncing tags to wordpress', error)
    }
  }
}
