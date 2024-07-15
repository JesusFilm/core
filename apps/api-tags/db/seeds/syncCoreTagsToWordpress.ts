import axios, { AxiosError, AxiosInstance } from 'axios'
import { PrismaClient, Tag } from '.prisma/api-tags-client'

const prisma = new PrismaClient()

// move base url to doppler
const wpApiUrl = 'https://develop.jesusfilm.org/wp-json/wp/v2'
const TAXONOMY_NAME = 'core_tags'

const auth = {
  // username: process.env.WP_USER,
  // password: process.env.WP_PASS
  username: 'JohnG',
  password: '#kU&T9nik2rnKfRh#lGBXeBU'
}

async function checkCoreTagExists(name: string) {
  const res = await axios.get(`${wpApiUrl}/${TAXONOMY_NAME}`, {
    params: { search: name },
    auth
  })
  return res.data.length > 0 ? res.data[0] : null
}

async function createWordPressCoreTag(tag: Tag): Promise<void> {
  await axios.post(`${wpApiUrl}/${TAXONOMY_NAME}`, { name: tag.name }, { auth })
}

async function updateWordPressCoreTag(id: string, tag: Tag): Promise<void> {
  await axios.put(
    `${wpApiUrl}/${TAXONOMY_NAME}/${id}`,
    { name: tag.name },
    { auth }
  )
}

export async function syncCoreTagsToWordpress(): Promise<void> {
  try {
    const tags = await prisma.tag.findMany({})

    for (const tag of tags) {
      const existingTag = await checkCoreTagExists(tag.name)
      if (existingTag != null) {
        await updateWordPressCoreTag(existingTag.id, tag)
      } else {
        await createWordPressCoreTag(tag)
      }
    }
  } catch (error) {
    console.log('Error syncing tags to wordpress', error)
  }
}
